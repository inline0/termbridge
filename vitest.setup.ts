import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

vi.mock("@silk-hq/components", () => {
  const sanitizeProps = (props: Record<string, unknown>) => {
    const next = { ...props };
    delete next.action;
    delete next.asChild;
    delete next.license;
    delete next.nativeEdgeSwipePrevention;
    delete next.themeColorDimming;
    return next;
  };

  const createComponent =
    (tag: keyof React.JSX.IntrinsicElements) =>
    ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) =>
      React.createElement(tag as string, sanitizeProps(rest), children);

  const SheetRoot = createComponent("div");
  const SheetView = createComponent("div");
  const SheetBackdrop = createComponent("div");
  const SheetContent = createComponent("div");
  const SheetBleedingBackground = createComponent("div");
  const SheetHandle = createComponent("button");
  const SheetOutlet = createComponent("div");
  const SheetTitle = createComponent("h2");
  const SheetDescription = createComponent("p");
  const SheetPortal = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const SheetTrigger = ({
    asChild,
    children,
    ...rest
  }: { asChild?: boolean; children?: React.ReactNode } & Record<string, unknown>) => {
    const sanitized = sanitizeProps(rest);
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, sanitized);
    }
    return React.createElement("button", { type: "button", ...sanitized }, children);
  };

  return {
    Sheet: {
      Root: SheetRoot,
      View: SheetView,
      Backdrop: SheetBackdrop,
      Content: SheetContent,
      BleedingBackground: SheetBleedingBackground,
      Handle: SheetHandle,
      Trigger: SheetTrigger,
      Portal: SheetPortal,
      Outlet: SheetOutlet,
      Title: SheetTitle,
      Description: SheetDescription
    }
  };
});

vi.mock("@xterm/xterm", () => ({
  Terminal: class {
    buffer = {
      active: {
        viewportY: 0,
        baseY: 0
      }
    };
    element: HTMLElement | null = null;
    loadAddon() {}
    open(container: HTMLElement) {
      this.element = container;
    }
    onData() {
      return () => {};
    }
    onScroll() {
      return () => {};
    }
    write() {}
    resize() {}
    scrollLines() {}
    scrollPages() {}
    scrollToTop() {}
    scrollToBottom() {}
    scrollToLine() {}
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

if (typeof window !== "undefined") {
  const css = window.CSS ?? ({} as typeof window.CSS);
  if (!("supports" in css)) {
    (css as { supports: (property: string, value?: string) => boolean }).supports = () => false;
  }
  window.CSS = css;
}

if (typeof HTMLElement !== "undefined") {
  if (!HTMLElement.prototype.scrollTo) {
    HTMLElement.prototype.scrollTo = () => undefined;
  }
  if (!HTMLElement.prototype.scrollBy) {
    HTMLElement.prototype.scrollBy = () => undefined;
  }
}

if (typeof globalThis !== "undefined" && !("__DAYTONA_SDK_VERSION__" in globalThis)) {
  (globalThis as { __DAYTONA_SDK_VERSION__?: string }).__DAYTONA_SDK_VERSION__ = "0.0.0";
}
