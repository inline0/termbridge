import type { Page } from "playwright";

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
  const xterm = await page.$(".terminal-host .xterm");

  if (xterm) {
    await page.click(".terminal-host .xterm");
  } else {
    await page.click(".terminal-host");
  }
};
