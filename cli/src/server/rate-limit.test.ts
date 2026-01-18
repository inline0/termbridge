import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows within the window and resets", () => {
    let now = 0;
    const limiter = createRateLimiter({
      limit: 2,
      windowMs: 1000,
      now: () => now
    });

    expect(limiter.allow("ip")).toBe(true);
    expect(limiter.allow("ip")).toBe(true);
    expect(limiter.allow("ip")).toBe(false);

    now = 2000;
    expect(limiter.allow("ip")).toBe(true);
  });

  it("defaults to the system clock", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(10);
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.allow("ip")).toBe(true);

    nowSpy.mockRestore();
  });
});
