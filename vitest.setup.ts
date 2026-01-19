import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@xterm/xterm", () => ({
  Terminal: class {
    loadAddon() {}
    open() {}
    onData() {}
    write() {}
    resize() {}
    scrollToBottom() {}
    dispose() {}
  }
}));

vi.mock("@xterm/addon-fit", () => ({
  FitAddon: class {
    fit() {}
    proposeDimensions() {
      return { cols: 80, rows: 24 };
    }
  }
}));

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as typeof window.matchMedia;
}

if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
}

if (typeof window !== "undefined" && !window.visualViewport) {
  Object.defineProperty(window, "visualViewport", {
    value: {
      height: 0,
      width: 0,
      offsetTop: 0,
      offsetLeft: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    },
    writable: true
  });
}

if (typeof document !== "undefined" && !document.timeline) {
  Object.defineProperty(document, "timeline", {
    value: { currentTime: 0 },
    writable: true
  });
}
