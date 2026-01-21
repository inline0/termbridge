import type { TerminalListItem, TerminalListResponse } from "@termbridge/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type ConnectionState,
  type TerminalClient,
  createTerminalClient
} from "./terminal-client";
import { TerminalControls } from "./terminal-controls";
import type { TerminalListState } from "./terminal-list-state";
import { ViewTabs } from "./view-tabs";

type CsrfResponse = { csrfToken: string };
type ConfigResponse = { proxyPort: number | null; devProxyUrl: string | null };

type TerminalPageProps = {
  terminalId?: string | null;
  onSelectTerminal?: (terminalId: string) => void;
};

export const TerminalPage = ({ terminalId, onSelectTerminal }: TerminalPageProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<TerminalClient | null>(null);
  const [state, setState] = useState<TerminalListState>("loading");
  const [terminals, setTerminals] = useState<TerminalListItem[]>([]);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [proxyPort, setProxyPort] = useState<number | null>(null);
  const [devProxyUrl, setDevProxyUrl] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"terminal" | "preview">("terminal");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [terminalsResponse, csrfResponse, configResponse] = await Promise.all([
          fetch("/__tb/api/terminals"),
          fetch("/__tb/api/csrf"),
          fetch("/__tb/api/config")
        ]);

        if (!terminalsResponse.ok || !csrfResponse.ok || !configResponse.ok) {
          throw new Error("api request failed");
        }

        const [terminalsPayload, csrfPayload, configPayload] = await Promise.all([
          terminalsResponse.json() as Promise<TerminalListResponse>,
          csrfResponse.json() as Promise<CsrfResponse>,
          configResponse.json() as Promise<ConfigResponse>
        ]);

        const nextTerminals = terminalsPayload.terminals;

        if (!active) {
          return;
        }

        setTerminals(nextTerminals);
        setCsrfToken(csrfPayload.csrfToken);
        setProxyPort(configPayload.proxyPort);
        setDevProxyUrl(configPayload.devProxyUrl);

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

    void loadData();

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
    if (state !== "ready" || !activeTerminalId || !csrfToken || !hostRef.current) {
      return;
    }

    setConnectionState("connecting");
    const client = createTerminalClient(hostRef.current, activeTerminalId, csrfToken);
    clientRef.current = client;

    const unsubscribe = client.onConnectionStateChange((nextState) => {
      setConnectionState(nextState);
    });

    return () => {
      unsubscribe();
      clientRef.current = null;
      client.destroy();
    };
  }, [state, activeTerminalId, csrfToken]);

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

  const handleSelectTerminal = onSelectTerminal ?? (() => undefined);

  const connectionIndicator = activeTerminalId ? (
    <span
      role="status"
      className={`absolute right-2 top-2 z-10 inline-block h-2 w-2 rounded-full ${
        connectionState === "connected"
          ? "bg-green-500"
          : connectionState === "reconnecting"
            ? "animate-pulse bg-yellow-500"
            : connectionState === "connecting"
              ? "animate-pulse bg-blue-400"
              : "bg-red-500"
      }`}
      data-testid="connection-indicator"
      data-state={connectionState}
      aria-label={connectionState}
    />
  ) : null;

  const showTabs = proxyPort !== null;

  return (
    <div
      className={`relative grid h-full w-full grid-cols-1 bg-background text-foreground ${
        showTabs ? "grid-rows-[auto_minmax(0,1fr)_auto]" : "grid-rows-[minmax(0,1fr)_auto]"
      }`}
    >
      {showTabs ? <ViewTabs activeView={activeView} onViewChange={setActiveView} /> : null}
      {statusLabel && activeView === "terminal" ? (
        <div
          className="terminal-status absolute inset-0 z-20 flex items-center justify-center bg-background/85 text-xs font-medium text-muted-foreground"
          role="status"
        >
          {statusLabel}
        </div>
      ) : null}
      {activeView === "terminal" ? connectionIndicator : null}
      <div className="min-h-0 min-w-0 relative">
        {showTabs ? (
          <iframe
            src={devProxyUrl ?? "/"}
            title="Preview"
            className={`h-full w-full border-0 ${activeView === "preview" ? "" : "invisible absolute inset-0"}`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            data-testid="preview-iframe"
          />
        ) : null}
        <div
          ref={hostRef}
          className={`terminal-host h-full w-full ${activeView === "preview" ? "invisible absolute inset-0" : ""}`}
          data-testid="terminal-host"
        />
      </div>
      <TerminalControls
        clientRef={clientRef}
        terminals={terminals}
        activeTerminalId={activeTerminalId}
        listState={state}
        onSelectTerminal={handleSelectTerminal}
      />
    </div>
  );
};
