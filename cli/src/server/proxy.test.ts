import { describe, expect, it } from "vitest";
import { resolveProxyUrl, getProxyWebSocketUrl, type ProxyConfig } from "./proxy";

describe("proxy utilities", () => {
  describe("resolveProxyUrl", () => {
    it("resolves URL with proxyPort", () => {
      const config: ProxyConfig = { proxyPort: 3000 };
      const url = resolveProxyUrl(config, "/api", "?foo=bar");
      expect(url?.toString()).toBe("http://localhost:3000/api?foo=bar");
    });

    it("resolves URL with devProxyUrl", () => {
      const config: ProxyConfig = { devProxyUrl: "https://example.com" };
      const url = resolveProxyUrl(config, "/api", "?foo=bar");
      expect(url?.toString()).toBe("https://example.com/api?foo=bar");
    });

    it("returns null when no proxy config", () => {
      const config: ProxyConfig = {};
      const url = resolveProxyUrl(config, "/api", "");
      expect(url).toBeNull();
    });

    it("returns null for invalid devProxyUrl", () => {
      const config: ProxyConfig = { devProxyUrl: "not-a-url" };
      const url = resolveProxyUrl(config, "/api", "");
      expect(url).toBeNull();
    });
  });

  describe("getProxyWebSocketUrl", () => {
    it("returns URL for proxyPort", () => {
      const config: ProxyConfig = { proxyPort: 3000 };
      const url = getProxyWebSocketUrl(config);
      expect(url?.toString()).toBe("http://localhost:3000/");
    });

    it("returns URL for devProxyUrl", () => {
      const config: ProxyConfig = { devProxyUrl: "https://example.com" };
      const url = getProxyWebSocketUrl(config);
      expect(url?.toString()).toBe("https://example.com/");
    });

    it("returns null when no proxy config", () => {
      const config: ProxyConfig = {};
      const url = getProxyWebSocketUrl(config);
      expect(url).toBeNull();
    });

    it("returns null for invalid devProxyUrl", () => {
      const config: ProxyConfig = { devProxyUrl: "not-a-url" };
      const url = getProxyWebSocketUrl(config);
      expect(url).toBeNull();
    });
  });
});
