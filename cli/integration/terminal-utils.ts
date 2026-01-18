import type { Page } from "playwright";

export const getTerminalText = async (page: Page) =>
  page.evaluate(() => {
    const host = document.querySelector(".terminal-host");
    const rows = host?.querySelectorAll(".xterm-rows .xterm-row") ?? [];
    const lines = Array.from(rows).map((row) => row.textContent ?? "");
    return lines.join("\n").replace(/\u00a0/g, " ");
  });

export const waitForTerminalText = async (page: Page, pattern: RegExp, timeoutMs = 10_000) => {
  await page.waitForFunction(
    ({ source, flags }) => {
      const host = document.querySelector(".terminal-host");
      const rows = host?.querySelectorAll(".xterm-rows .xterm-row") ?? [];
      const lines = Array.from(rows).map((row) => row.textContent ?? "");
      const content = lines.join("\n").replace(/\u00a0/g, " ");
      return new RegExp(source, flags).test(content);
    },
    { source: pattern.source, flags: pattern.flags },
    { timeout: timeoutMs }
  );
};

export const focusTerminal = async (page: Page) => {
  await page.waitForSelector(".terminal-host", { timeout: 30_000 });
  const xterm = await page.$(".terminal-host .xterm");

  if (xterm) {
    await page.click(".terminal-host .xterm");
  } else {
    await page.click(".terminal-host");
  }
};
