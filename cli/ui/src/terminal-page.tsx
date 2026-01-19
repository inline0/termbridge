import type { TerminalListItem, TerminalListResponse } from "@termbridge/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import { type TerminalClient, createTerminalClient } from "./terminal-client";
import { TerminalControls } from "./terminal-controls";
import type { TerminalListState } from "./terminal-list-state";

type TerminalPageProps = {
  terminalId?: string | null;
  onSelectTerminal?: (terminalId: string) => void;
};

export const TerminalPage = ({ terminalId, onSelectTerminal }: TerminalPageProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<TerminalClient | null>(null);
  const [state, setState] = useState<TerminalListState>("loading");
  const [terminals, setTerminals] = useState<TerminalListItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadTerminals = async () => {
      try {
        const response = await fetch("/api/terminals");

        if (!response.ok) {
          throw new Error("terminal list request failed");
        }

        const payload = (await response.json()) as TerminalListResponse;
        const nextTerminals = payload.terminals;

        if (!active) {
          return;
        }

        setTerminals(nextTerminals);

        if (nextTerminals.length === 0) {
          setState("empty");
          return;
        }

        setState("ready");
      } catch {
        if (active) {
          setState("error");
        }
      }
    };

    void loadTerminals();

    return () => {
      active = false;
    };
  }, []);

  const activeTerminalId = useMemo(() => {
    if (state !== "ready" || !terminalId) {
      return null;
    }

    return terminals.some((terminal) => terminal.id === terminalId) ? terminalId : null;
  }, [state, terminalId, terminals]);

  useEffect(() => {
    if (state !== "ready" || terminals.length === 0) {
      return;
    }

    const hasMatch = terminalId
      ? terminals.some((terminal) => terminal.id === terminalId)
      : false;

    if (hasMatch) {
      return;
    }

    const fallback = terminals[0]?.id;
    if (fallback && onSelectTerminal) {
      onSelectTerminal(fallback);
    }
  }, [state, terminals, terminalId, onSelectTerminal]);

  useEffect(() => {
    if (state !== "ready" || !activeTerminalId || !hostRef.current) {
      return;
    }

    const client = createTerminalClient(hostRef.current, activeTerminalId);
    clientRef.current = client;

    return () => {
      clientRef.current = null;
      client.destroy();
    };
  }, [state, activeTerminalId]);

  const statusLabel =
    state === "loading"
      ? "Loading terminal"
      : state === "empty"
        ? "No terminals available"
        : state === "error"
          ? "Unable to load terminals"
          : activeTerminalId
            ? null
            : "Loading terminal";

  return (
    <div className="relative grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] bg-background text-foreground">
      {statusLabel ? (
        <div
          className="terminal-status absolute inset-0 z-20 flex items-center justify-center bg-background/85 text-xs font-medium text-muted-foreground"
          role="status"
        >
          {statusLabel}
        </div>
      ) : null}
      <div className="min-h-0 min-w-0">
        <div
          ref={hostRef}
          className="terminal-host h-full w-full"
          data-testid="terminal-host"
        />
      </div>
      <TerminalControls
        clientRef={clientRef}
        terminals={terminals}
        activeTerminalId={activeTerminalId}
        listState={state}
        onSelectTerminal={onSelectTerminal ?? (() => undefined)}
      />
    </div>
  );
};
