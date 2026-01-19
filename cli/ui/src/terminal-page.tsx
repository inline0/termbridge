import type { TerminalListResponse } from "@termbridge/shared";
import { useEffect, useRef, useState } from "react";
import { type TerminalClient, createTerminalClient } from "./terminal-client";
import { TerminalControls } from "./terminal-controls";

type LoadState = "loading" | "ready" | "empty" | "error";

export const TerminalPage = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<TerminalClient | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [terminalId, setTerminalId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTerminals = async () => {
      try {
        const response = await fetch("/api/terminals");

        if (!response.ok) {
          throw new Error("terminal list request failed");
        }

        const payload = (await response.json()) as TerminalListResponse;
        const first = payload.terminals[0];

        if (!active) {
          return;
        }

        if (!first) {
          setState("empty");
          return;
        }

        setTerminalId(first.id);
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

  useEffect(() => {
    if (state !== "ready" || !terminalId || !hostRef.current) {
      return;
    }

    const client = createTerminalClient(hostRef.current, terminalId);
    clientRef.current = client;

    return () => {
      clientRef.current = null;
      client.destroy();
    };
  }, [state, terminalId]);

  const statusLabel =
    state === "loading"
      ? "Loading terminal"
      : state === "empty"
        ? "No terminals available"
        : state === "error"
          ? "Unable to load terminals"
          : null;

  return (
    <div className="relative grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] bg-background text-foreground">
      {statusLabel ? (
        <div
          className="terminal-status absolute inset-0 z-20 flex items-center justify-center bg-background/85 text-xs font-medium uppercase tracking-[0.2em]"
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
      <TerminalControls clientRef={clientRef} />
    </div>
  );
};
