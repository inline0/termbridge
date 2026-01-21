import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { TerminalListItem } from "@termbridge/shared";
import { TerminalPage } from "./terminal-page";
import type { TerminalClient } from "./terminal-client";

vi.mock("./terminal-client", () => ({
  createTerminalClient: vi.fn()
}));

import { createTerminalClient } from "./terminal-client";

describe("TerminalPage", () => {
  const originalFetch = global.fetch;
  const createTerminalClientMock = vi.mocked(createTerminalClient);
  const makeTerminal = (id: string): TerminalListItem => ({
    id,
    label: `Terminal ${id}`,
    status: "running",
    createdAt: "2024-01-01T00:00:00.000Z",
    source: "tmux"
  });

  const createMockClient = (overrides: {
    destroy?: ReturnType<typeof vi.fn>;
    sendControl?: ReturnType<typeof vi.fn>;
    sendInput?: ReturnType<typeof vi.fn>;
    getConnectionState?: ReturnType<typeof vi.fn>;
    onConnectionStateChange?: ReturnType<typeof vi.fn>;
  } = {}): TerminalClient => ({
    destroy: overrides.destroy ?? vi.fn(),
    sendControl: overrides.sendControl ?? vi.fn(),
    sendInput: overrides.sendInput ?? vi.fn(),
    getConnectionState: overrides.getConnectionState ?? vi.fn(() => "connected"),
    onConnectionStateChange: overrides.onConnectionStateChange ?? vi.fn(() => () => undefined)
  }) as TerminalClient;

  const createMockFetch = (terminals: TerminalListItem[], options: { status?: number; proxyPort?: number | null } = {}) => {
    const status = options.status ?? 200;
    const proxyPort = options.proxyPort ?? null;
    return vi.fn(async (url: string) => {
      if (url.includes("/__tb/api/csrf")) {
        return new Response(JSON.stringify({ csrfToken: "test-csrf-token" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (url.includes("/__tb/api/config")) {
        return new Response(JSON.stringify({ proxyPort }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ terminals }), {
        status,
        headers: { "Content-Type": "application/json" }
      });
    }) as unknown as typeof fetch;
  };

  beforeEach(() => {
    createTerminalClientMock.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  it("shows loading state", async () => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;

    render(<TerminalPage terminalId={null} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading terminal");
  });

  it("handles empty lists", async () => {
    global.fetch = createMockFetch([]);

    render(<TerminalPage terminalId={null} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("No terminals available");
    });
  });

  it("handles errors", async () => {
    global.fetch = createMockFetch([], { status: 500 });

    render(<TerminalPage terminalId={null} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Unable to load terminals");
    });
  });

  it("creates the terminal client for the first session", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    const { unmount } = render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    unmount();
    expect(destroy).toHaveBeenCalled();
  });

  it("navigates to the first terminal when none is selected", async () => {
    global.fetch = createMockFetch([makeTerminal("term-1")]);
    const onSelectTerminal = vi.fn();

    render(<TerminalPage terminalId={null} onSelectTerminal={onSelectTerminal} />);

    await waitFor(() => {
      expect(onSelectTerminal).toHaveBeenCalledWith("term-1");
    });
  });

  it("navigates to the first terminal when the id is unknown", async () => {
    global.fetch = createMockFetch([makeTerminal("term-1"), makeTerminal("term-2")]);
    const onSelectTerminal = vi.fn();

    render(<TerminalPage terminalId="term-99" onSelectTerminal={onSelectTerminal} />);

    await waitFor(() => {
      expect(onSelectTerminal).toHaveBeenCalledWith("term-1");
    });
  });

  it("uses a fallback selection handler when none is provided", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    const button = await screen.findByLabelText("Open Terminal term-1");
    fireEvent.click(button);

    expect(screen.getByTestId("terminal-host")).toBeInTheDocument();
  });

  it("ignores send clicks before the terminal client is ready", () => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;

    render(<TerminalPage terminalId="term-1" />);

    fireEvent.click(screen.getByLabelText("Send"));

    expect(createTerminalClientMock).not.toHaveBeenCalled();
  });

  it("avoids state updates after unmount", async () => {
    let resolveFetch: (value: Response) => void = () => undefined;

    global.fetch = vi.fn(() =>
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    ) as typeof fetch;

    const { unmount } = render(<TerminalPage terminalId="term-1" />);
    unmount();

    resolveFetch({
      ok: true,
      json: async () => ({ terminals: [makeTerminal("term-1")] })
    } as Response);

    await Promise.resolve();

    expect(createTerminalClientMock).not.toHaveBeenCalled();
  });

  it("ignores errors after unmount", async () => {
    let rejectFetch: (error: Error) => void = () => undefined;

    global.fetch = vi.fn(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        })
    ) as typeof fetch;

    const { unmount } = render(<TerminalPage terminalId="term-1" />);
    unmount();

    rejectFetch(new Error("boom"));
    await Promise.resolve();

    expect(createTerminalClientMock).not.toHaveBeenCalled();
  });

  it("sends input when the send button is clicked", async () => {
    const destroy = vi.fn();
    const sendInput = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy, sendInput }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "ls -la" } });
    fireEvent.click(screen.getByLabelText("Send"));

    expect(sendInput).toHaveBeenCalledWith("ls -la");
    expect(sendInput).toHaveBeenCalledWith("\r");
    expect(input).toHaveValue("");
  });

  it("sends only a newline when the message is empty", async () => {
    const destroy = vi.fn();
    const sendInput = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy, sendInput }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText("Send"));

    expect(sendInput).toHaveBeenCalledTimes(1);
    expect(sendInput).toHaveBeenCalledWith("\r");
  });

  it("sends input on enter keypress", async () => {
    const destroy = vi.fn();
    const sendInput = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy, sendInput }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "pwd" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(sendInput).toHaveBeenCalledWith("pwd");
    expect(sendInput).toHaveBeenCalledWith("\r");
  });

  it("ignores non-enter keypresses in the message input", async () => {
    const destroy = vi.fn();
    const sendInput = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy, sendInput }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "pwd" } });
    fireEvent.keyDown(input, { key: "a", code: "KeyA" });

    expect(sendInput).not.toHaveBeenCalled();
  });

  it("shows action bar and sends control keys", async () => {
    const destroy = vi.fn();
    const sendControl = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy, sendControl }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText("Add"));
    const actionButton = screen.getByLabelText("Up");
    fireEvent.click(actionButton);

    expect(sendControl).toHaveBeenCalledWith("up");
  });

  it("sends input for enter action", async () => {
    const destroy = vi.fn();
    const sendInput = vi.fn();
    const sendControl = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy, sendControl, sendInput }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText("Add"));
    fireEvent.click(screen.getByLabelText("Enter"));

    expect(sendInput).toHaveBeenCalledWith("\r");
    expect(sendControl).not.toHaveBeenCalled();
  });

  it("ignores action presses before the terminal client is ready", () => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;

    render(<TerminalPage terminalId="term-1" />);

    fireEvent.click(screen.getByLabelText("Add"));
    fireEvent.click(screen.getByLabelText("Up"));

    expect(createTerminalClientMock).not.toHaveBeenCalled();
  });

  it("wires a resize observer for the actions strip when available", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    const observe = vi.fn();
    const disconnect = vi.fn();
    const originalResizeObserver = window.ResizeObserver;

    class ResizeObserverMock {
      observe = observe;
      disconnect = disconnect;
    }

    window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

    const { unmount } = render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText("Add"));

    expect(observe).toHaveBeenCalled();

    unmount();
    expect(disconnect).toHaveBeenCalled();

    window.ResizeObserver = originalResizeObserver;
  });

  it("shows scroll gradients when actions overflow", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText("Add"));
    const scrollArea = screen.getByTestId("terminal-actions-scroll");

    Object.defineProperty(scrollArea, "scrollWidth", { value: 300, configurable: true });
    Object.defineProperty(scrollArea, "clientWidth", { value: 100, configurable: true });

    scrollArea.scrollLeft = 0;
    fireEvent.scroll(scrollArea);

    await waitFor(() => {
      expect(screen.queryByTestId("terminal-actions-gradient-left")).toBeNull();
      expect(screen.getByTestId("terminal-actions-gradient-right")).toBeTruthy();
    });

    scrollArea.scrollLeft = 120;
    fireEvent.scroll(scrollArea);

    await waitFor(() => {
      expect(screen.getByTestId("terminal-actions-gradient-left")).toBeTruthy();
      expect(screen.getByTestId("terminal-actions-gradient-right")).toBeTruthy();
    });
  });

  it("shows connection status indicator", async () => {
    const destroy = vi.fn();
    type StateCallback = (state: string) => void;
    const callbackRef: { current: StateCallback | null } = { current: null };
    const onConnectionStateChange = vi.fn((callback: StateCallback) => {
      callbackRef.current = callback;
      return () => {
        callbackRef.current = null;
      };
    });
    createTerminalClientMock.mockReturnValue(
      createMockClient({ destroy, onConnectionStateChange })
    );

    global.fetch = createMockFetch([makeTerminal("term-1")]);

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    expect(screen.getByTestId("connection-indicator")).toHaveAttribute("data-state", "connecting");

    callbackRef.current?.("connected");
    await waitFor(() => {
      expect(screen.getByTestId("connection-indicator")).toHaveAttribute("data-state", "connected");
    });

    callbackRef.current?.("reconnecting");
    await waitFor(() => {
      expect(screen.getByTestId("connection-indicator")).toHaveAttribute("data-state", "reconnecting");
    });

    callbackRef.current?.("disconnected");
    await waitFor(() => {
      expect(screen.getByTestId("connection-indicator")).toHaveAttribute("data-state", "disconnected");
    });
  });

  it("does not show tabs when proxyPort is null", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")], { proxyPort: null });

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByTestId("terminal-host")).toBeInTheDocument();
  });

  it("shows tabs when proxyPort is configured", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")], { proxyPort: 5173 });

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Terminal" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "false");
  });

  it("switches to preview view when Preview tab is clicked", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")], { proxyPort: 5173 });

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("tab", { name: "Preview" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: "Terminal" })).toHaveAttribute("aria-selected", "false");
    });

    expect(screen.getByTestId("preview-iframe")).toBeInTheDocument();
    expect(screen.getByTestId("preview-iframe")).toHaveAttribute("src", "/");
    expect(screen.getByTestId("terminal-host")).toHaveClass("invisible");
  });

  it("keeps controls visible when in preview view", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue(createMockClient({ destroy }));

    global.fetch = createMockFetch([makeTerminal("term-1")], { proxyPort: 5173 });

    render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    expect(screen.getByLabelText("Message")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Preview" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true");
    });

    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });
});
