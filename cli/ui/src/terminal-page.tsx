import type { TerminalListResponse } from "@termbridge/shared";
import { Button, Input } from "@termbridge/ui";
import { useEffect, useRef, useState } from "react";
import { createTerminalClient } from "./terminal-client";
import { PlusIcon, SendIcon } from "lucide-react";

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
    <div className="relative grid h-full w-full grid-rows-[minmax(0,1fr)_auto] bg-background text-foreground">
      {statusLabel ? (
        <div
          className="terminal-status absolute inset-0 z-20 flex items-center justify-center bg-background/85 text-xs font-medium uppercase tracking-[0.2em]"
          role="status"
        >
          {statusLabel}
        </div>
      ) : null}
      <div className="min-h-0">
        <div
          ref={hostRef}
          className="terminal-host h-full w-full"
          data-testid="terminal-host"
        />
      </div>
      <div className="bg-sidebar px-3 py-3">
        <div className="flex w-full items-center gap-3">
          <Button type="button" variant="secondary" size="icon" aria-label="Add" className="bg-input/50 h-10 w-10 rounded-full">
            <PlusIcon className="size-4" />
          </Button>
          <div className="relative flex-1">
            <Input
              placeholder="Message"
              aria-label="Message"
              className="bg-input/50 h-11 pl-4 pr-8 rounded-full border-none"
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              aria-label="Send"
              className="absolute right-1 w-9 h-9 top-1/2 -translate-y-1/2 rounded-full"
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
