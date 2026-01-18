import { beforeEach, describe, expect, it, vi } from "vitest";

const render = vi.fn();
const createRoot = vi.fn(() => ({ render }));

vi.mock("react-dom/client", () => ({
  createRoot
}));

describe("main", () => {
  beforeEach(() => {
    render.mockReset();
    createRoot.mockClear();
    document.body.innerHTML = "";
    vi.resetModules();
  });

  it("mounts the app", async () => {
    document.body.innerHTML = "<div id=\"root\"></div>";
    const { mountApp } = await import("./main");
    const root = document.getElementById("root");

    if (!root) {
      throw new Error("missing root element");
    }

    mountApp(root);
    expect(createRoot).toHaveBeenCalled();
    expect(render).toHaveBeenCalled();
  });

  it("skips mounting without a root element", async () => {
    await import("./main");
    expect(createRoot).not.toHaveBeenCalled();
  });
});
