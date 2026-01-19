import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { TerminalListItem } from "@termbridge/shared";
import { TerminalSwitcher } from "./terminal-switcher";

const makeTerminal = (id: string): TerminalListItem => ({
  id,
  label: `Terminal ${id}`,
  status: "running",
  createdAt: "2024-01-01T00:00:00.000Z",
  source: "tmux"
});

describe("TerminalSwitcher", () => {
  afterEach(() => {
    cleanup();
  });

  const openSheet = () => {
    fireEvent.click(screen.getAllByLabelText("Terminals")[0]);
  };

  it("shows loading copy", async () => {
    render(
      <TerminalSwitcher
        terminals={[]}
        activeTerminalId={null}
        listState="loading"
        onSelectTerminal={vi.fn()}
      />
    );

    openSheet();

    expect(await screen.findByText("Loading terminals")).toBeInTheDocument();
  });

  it("shows empty copy", async () => {
    render(
      <TerminalSwitcher
        terminals={[]}
        activeTerminalId={null}
        listState="empty"
        onSelectTerminal={vi.fn()}
      />
    );

    openSheet();

    expect(await screen.findByText("No terminals available")).toBeInTheDocument();
  });

  it("shows error copy", async () => {
    render(
      <TerminalSwitcher
        terminals={[]}
        activeTerminalId={null}
        listState="error"
        onSelectTerminal={vi.fn()}
      />
    );

    openSheet();

    expect(await screen.findByText("Unable to load terminals")).toBeInTheDocument();
  });

  it("selects a terminal and highlights the active item", async () => {
    const onSelectTerminal = vi.fn();
    const terminals = [makeTerminal("term-1"), makeTerminal("term-2")];

    render(
      <TerminalSwitcher
        terminals={terminals}
        activeTerminalId="term-1"
        listState="ready"
        onSelectTerminal={onSelectTerminal}
      />
    );

    openSheet();

    const item = await screen.findByLabelText("Open Terminal term-2");
    fireEvent.click(item);

    expect(onSelectTerminal).toHaveBeenCalledWith("term-2");
    expect(await screen.findByLabelText("Open Terminal term-1")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("falls back to the id label and shows closed mock status", async () => {
    render(
      <TerminalSwitcher
        terminals={[
          {
            id: "term-closed",
            label: "",
            status: "closed",
            createdAt: "2024-01-01T00:00:00.000Z",
            source: "mock"
          }
        ]}
        activeTerminalId={null}
        listState="ready"
        onSelectTerminal={vi.fn()}
      />
    );

    openSheet();

    expect(await screen.findByText("Closed - Mock")).toBeInTheDocument();
    expect(await screen.findByLabelText("Open term-closed")).toBeInTheDocument();
  });
});
