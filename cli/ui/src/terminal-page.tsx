import { useEffect, useRef, useState } from "react";
import type { TerminalListResponse } from "@termbridge/shared";
import { createTerminalClient } from "./terminal-client";

type LoadState = "loading" | "ready" | "empty" | "error";

export const TerminalPage = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
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

    return () => {
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
    <div className="terminal-shell">
      {statusLabel ? (
        <div className="terminal-status" role="status">
          {statusLabel}
        </div>
      ) : null}
      <div ref={hostRef} className="terminal-host" data-testid="terminal-host" />
    </div>
  );
};
