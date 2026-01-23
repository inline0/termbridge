import type { BrowserContext, Page } from "playwright";
import { buildUrl, parseShareUrl } from "./share-utils";

export const getTerminalText = async (page: Page) =>
  page.evaluate(() => {
    const terminal = (window as typeof window & { __TERMbridgeTerminal?: any })
      .__TERMbridgeTerminal;
    const buffer = terminal?.buffer?.active;
    if (!buffer) {
      return "";
    }

    const bufferLines: string[] = [];
    for (let i = 0; i < buffer.length; i += 1) {
      const line = buffer.getLine(i);
      if (line) {
        bufferLines.push(line.translateToString(true));
      }
    }
    return bufferLines.join("\n");
  });

export const waitForTerminalText = async (page: Page, pattern: RegExp, timeoutMs = 10_000) => {
  await page.waitForFunction(
    ({ source, flags }) => {
      const regex = new RegExp(source, flags);
      const terminal = (window as typeof window & { __TERMbridgeTerminal?: any })
        .__TERMbridgeTerminal;
      const buffer = terminal?.buffer?.active;
      if (!buffer) {
        return false;
      }

      const bufferLines: string[] = [];
      for (let i = 0; i < buffer.length; i += 1) {
        const line = buffer.getLine(i);
        if (line) {
          bufferLines.push(line.translateToString(true));
        }
      }
      return regex.test(bufferLines.join("\n"));
    },
    { source: pattern.source, flags: pattern.flags },
    { timeout: timeoutMs }
  );
};

export const focusTerminal = async (page: Page) => {
  await page.waitForSelector(".terminal-host", { timeout: 30_000 });
  const helper = await page.$(".terminal-host .xterm-helper-textarea");
  if (helper) {
    await helper.focus();
    return;
  }

  const xterm = await page.$(".terminal-host .xterm");

  if (xterm) {
    await page.click(".terminal-host .xterm");
  } else {
    await page.click(".terminal-host");
  }
};

const fetchWithTimeout = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { redirect: "manual", signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const isNetworkError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("enotfound") ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timeout")
  );
};

export const redeemShareUrl = async (
  context: BrowserContext,
  shareUrl: string,
  options: {
    timeoutMs?: number;
    fallbackBaseUrl?: URL;
    log?: (message: string) => void;
  } = {}
) => {
  const { baseUrl: shareBase, token } = parseShareUrl(shareUrl);
  const timeoutMs = options.timeoutMs ?? 15_000;
  let baseUrl = shareBase;
  let redeemUrl = shareUrl;

  const attemptRedeem = async (url: string) => {
    const response = await fetchWithTimeout(url, timeoutMs);
    return response;
  };

  const tryBrowserRedeem = async (url: string) => {
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    } finally {
      await page.close();
    }
  };

  try {
    await tryBrowserRedeem(redeemUrl);
  } catch (error) {
    if (options.fallbackBaseUrl && isNetworkError(error)) {
      baseUrl = options.fallbackBaseUrl;
      redeemUrl = buildUrl(baseUrl, `__tb/s/${token}`);
      options.log?.(`share url unreachable; falling back to ${baseUrl.host}`);
      await tryBrowserRedeem(redeemUrl);
    }
  }

  const browserCookies = await context.cookies(baseUrl.toString());
  if (browserCookies.length > 0) {
    const hasSession = browserCookies.some((cookie) => cookie.name === "termbridge_session");
    if (hasSession) {
      return {
        baseUrl,
        sessionCookie: browserCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ")
      };
    }
  }

  let redeemResponse: Response;
  try {
    redeemResponse = await attemptRedeem(redeemUrl);
  } catch (error) {
    if (options.fallbackBaseUrl && isNetworkError(error)) {
      baseUrl = options.fallbackBaseUrl;
      redeemUrl = buildUrl(baseUrl, `__tb/s/${token}`);
      options.log?.(`share url unreachable; falling back to ${baseUrl.host}`);
      redeemResponse = await attemptRedeem(redeemUrl);
    } else {
      throw error;
    }
  }

  if (redeemResponse.status !== 302) {
    throw new Error(`redeem failed with status ${redeemResponse.status}`);
  }

  const setCookies =
    typeof (redeemResponse.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie ===
    "function"
      ? (redeemResponse.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : [];
  if (setCookies.length === 0) {
    const fallbackCookie = redeemResponse.headers.get("set-cookie");
    if (fallbackCookie) {
      setCookies.push(fallbackCookie);
    }
  }
  if (setCookies.length === 0) {
    throw new Error("redeem missing set-cookie header");
  }

  const isSecure = baseUrl.protocol === "https:";
  const cookiesToAdd: Array<{
    name: string;
    value: string;
    url: string;
    sameSite: "Lax" | "None";
    secure: boolean;
    httpOnly: boolean;
  }> = [];
  let sessionCookie = "";

  for (const cookie of setCookies) {
    const cookiePair = cookie.split(";")[0] ?? "";
    const [name, value] = cookiePair.split("=");
    if (!name || !value) {
      continue;
    }
    cookiesToAdd.push({
      name,
      value,
      url: baseUrl.toString(),
      sameSite: isSecure ? "None" : "Lax",
      secure: isSecure,
      httpOnly: true
    });
    if (name === "termbridge_session") {
      sessionCookie = cookiePair;
    }
  }

  if (cookiesToAdd.length === 0) {
    throw new Error("invalid redeem cookie");
  }

  await context.addCookies(cookiesToAdd);

  const mergedCookies = await context.cookies(baseUrl.toString());
  const mergedHeader =
    mergedCookies.length > 0
      ? mergedCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ")
      : sessionCookie;

  return { baseUrl, sessionCookie: mergedHeader };
};

export const waitForTerminalConnected = async (page: Page, timeoutMs = 30_000) => {
  await page.waitForSelector(".terminal-host .xterm-screen canvas", { timeout: timeoutMs });
  await page.waitForSelector('[data-testid="connection-status"][data-state="connected"]', {
    timeout: timeoutMs
  });
};

export const sendTerminalInputAndWait = async (
  page: Page,
  command: string,
  pattern: RegExp,
  timeoutMs = 20_000
) => {
  await focusTerminal(page);
  await page.keyboard.type(command);
  await page.keyboard.press("Enter");
  try {
    await waitForTerminalText(page, pattern, timeoutMs);
  } catch (error) {
    const snapshot = await getTerminalText(page).catch(() => "");
    const message = error instanceof Error ? error.message : String(error);
    const detail = snapshot ? `terminal buffer:\n${snapshot.slice(-2000)}` : "";
    throw new Error([message, detail].filter(Boolean).join("\n"));
  }
};

export const waitForLocatorText = async (
  locator: ReturnType<Page["locator"]>,
  expected: string,
  timeoutMs = 5_000
) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const text = await locator.textContent().catch(() => null);
    if (text === expected) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const actual = await locator.textContent().catch(() => "(unavailable)");
  throw new Error(`expected "${expected}" but got "${actual}"`);
};
