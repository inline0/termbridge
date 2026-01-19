import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { TerminalListItem } from "@termbridge/shared";
import { TerminalPage } from "./terminal-page";

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
    const response = new Response(JSON.stringify({ terminals: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    render(<TerminalPage terminalId={null} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("No terminals available");
    });
  });

  it("handles errors", async () => {
    const response = new Response("", { status: 500 });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    render(<TerminalPage terminalId={null} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Unable to load terminals");
    });
  });

  it("creates the terminal client for the first session", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue({
      destroy,
      sendControl: vi.fn(),
      sendInput: vi.fn()
    });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    const { unmount } = render(<TerminalPage terminalId="term-1" />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    unmount();
    expect(destroy).toHaveBeenCalled();
  });

  it("navigates to the first terminal when none is selected", async () => {
    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;
    const onSelectTerminal = vi.fn();

    render(<TerminalPage terminalId={null} onSelectTerminal={onSelectTerminal} />);

    await waitFor(() => {
      expect(onSelectTerminal).toHaveBeenCalledWith("term-1");
    });
  });

  it("navigates to the first terminal when the id is unknown", async () => {
    const response = new Response(
      JSON.stringify({ terminals: [makeTerminal("term-1"), makeTerminal("term-2")] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;
    const onSelectTerminal = vi.fn();

    render(<TerminalPage terminalId="term-99" onSelectTerminal={onSelectTerminal} />);

    await waitFor(() => {
      expect(onSelectTerminal).toHaveBeenCalledWith("term-1");
    });
  });

  it("uses a fallback selection handler when none is provided", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue({
      destroy,
      sendControl: vi.fn(),
      sendInput: vi.fn()
    });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({ destroy, sendControl: vi.fn(), sendInput });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({ destroy, sendControl: vi.fn(), sendInput });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({ destroy, sendControl: vi.fn(), sendInput });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({ destroy, sendControl: vi.fn(), sendInput });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({ destroy, sendControl, sendInput: vi.fn() });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({ destroy, sendControl, sendInput });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({
      destroy,
      sendControl: vi.fn(),
      sendInput: vi.fn()
    });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
    createTerminalClientMock.mockReturnValue({
      destroy,
      sendControl: vi.fn(),
      sendInput: vi.fn()
    });

    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

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
});
