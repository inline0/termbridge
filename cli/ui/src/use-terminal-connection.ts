import type { TerminalListItem, TerminalListResponse } from "@termbridge/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type ConnectionState,
  type TerminalClient,
  type ScrollInfo,
  createTerminalClient
} from "./terminal-client";
import type { TerminalListState } from "./terminal-list-state";

type CsrfResponse = { csrfToken: string };
type ConfigResponse = {
  proxyPort: number | null;
  devProxyUrl: string | null;
  hideTerminalSwitcher?: boolean;
  wsToken?: string;
};

export type UseTerminalConnectionOptions = {
  terminalId?: string | null;
  onSelectTerminal?: (terminalId: string) => void;
};

export type UseTerminalConnectionResult = {
  hostRef: React.RefObject<HTMLDivElement | null>;
  clientRef: React.RefObject<TerminalClient | null>;
  state: TerminalListState;
  terminals: TerminalListItem[];
  connectionState: ConnectionState;
  activeTerminalId: string | null;
  activeTerminalSource: TerminalListItem["source"] | null;
  activeTerminalLabel: string | null | undefined;
  proxyPort: number | null;
  devProxyUrl: string | null;
  hideTerminalSwitcher: boolean;
  scrollInfo: ScrollInfo;
  tmuxScroll: { offset: number; mode: "lines" | "pages" } | null;
  handleScrollAction: (mode: "lines" | "pages", amount: number) => void;
  handleSelectTerminal: (terminalId: string) => void;
};

export const useTerminalConnection = ({
  terminalId,
  onSelectTerminal
}: UseTerminalConnectionOptions): UseTerminalConnectionResult => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<TerminalClient | null>(null);
  const [state, setState] = useState<TerminalListState>("loading");
  const [terminals, setTerminals] = useState<TerminalListItem[]>([]);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [proxyPort, setProxyPort] = useState<number | null>(null);
  const [devProxyUrl, setDevProxyUrl] = useState<string | null>(null);
  const [hideTerminalSwitcher, setHideTerminalSwitcher] = useState(false);
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({ viewportY: 0, baseY: 0, maxY: 0 });
  const [tmuxScroll, setTmuxScroll] = useState<{ offset: number; mode: "lines" | "pages" } | null>(
    null
  );

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
        setHideTerminalSwitcher(Boolean(configPayload.hideTerminalSwitcher));
        setWsToken(configPayload.wsToken ?? null);

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

  const activeTerminalSource = useMemo(() => {
    if (state !== "ready" || !activeTerminalId) {
      return null;
    }

    return terminals.find((terminal) => terminal.id === activeTerminalId)?.source ?? null;
  }, [state, activeTerminalId, terminals]);

  const activeTerminalLabel = useMemo(() => {
    if (state !== "ready" || !activeTerminalId) {
      return null;
    }

    const terminal = terminals.find((entry) => entry.id === activeTerminalId);
    return terminal?.label ?? terminal?.id;
  }, [state, activeTerminalId, terminals]);

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
    const client = createTerminalClient(hostRef.current, activeTerminalId, csrfToken, {
      wsToken: wsToken ?? undefined
    });
    clientRef.current = client;

    setScrollInfo(client.getScrollInfo());

    const unsubscribeConnection = client.onConnectionStateChange((nextState) => {
      setConnectionState(nextState);
    });
    const unsubscribeScroll = client.onScroll((info) => {
      setScrollInfo(info);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeScroll();
      clientRef.current = null;
      client.destroy();
      setScrollInfo({ viewportY: 0, baseY: 0, maxY: 0 });
      setTmuxScroll(null);
    };
  }, [state, activeTerminalId, csrfToken, wsToken]);

  const handleScrollAction = (mode: "lines" | "pages", amount: number) => {
    if (activeTerminalSource !== "tmux") {
      return;
    }

    setTmuxScroll((prev) => {
      const nextMode = mode;
      const baseOffset = prev?.mode === nextMode ? prev.offset : 0;
      const nextOffset = Math.max(0, baseOffset + -amount);

      if (nextOffset === 0) {
        return null;
      }

      return { offset: nextOffset, mode: nextMode };
    });
  };

  const handleSelectTerminal = onSelectTerminal ?? (() => undefined);

  return {
    hostRef,
    clientRef,
    state,
    terminals,
    connectionState,
    activeTerminalId,
    activeTerminalSource,
    activeTerminalLabel,
    proxyPort,
    devProxyUrl,
    hideTerminalSwitcher,
    scrollInfo,
    tmuxScroll,
    handleScrollAction,
    handleSelectTerminal
  };
};
