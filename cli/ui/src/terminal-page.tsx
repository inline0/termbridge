import { useState } from "react";
import { TerminalControls } from "./terminal-controls";
import { TerminalStatusBar } from "./terminal-status-bar";
import { useTerminalConnection } from "./use-terminal-connection";

type TerminalPageProps = {
  terminalId?: string | null;
  onSelectTerminal?: (terminalId: string) => void;
};

export const TerminalPage = ({ terminalId, onSelectTerminal }: TerminalPageProps) => {
  const [activeView, setActiveView] = useState<"terminal" | "preview">("terminal");

  const {
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
  } = useTerminalConnection({ terminalId, onSelectTerminal });

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

  const showPreview = proxyPort !== null || devProxyUrl !== null;
  const previewSrc = "/";
  const resolvedView = showPreview ? activeView : "terminal";
  const scrollOverride =
    activeTerminalSource === "tmux" && tmuxScroll
      ? {
          label: `${tmuxScroll.offset}${tmuxScroll.mode === "pages" ? "p" : "l"}`,
          show: tmuxScroll.offset > 0
        }
      : undefined;

  const gridRows = "grid-rows-[auto_minmax(0,1fr)_auto]";

  return (
    <div className="relative h-full w-full bg-background text-foreground">
      <div className={`grid h-full w-full ${gridRows}`}>
        <TerminalStatusBar
          connectionState={connectionState}
          scrollInfo={scrollInfo}
          hasTerminal={Boolean(activeTerminalId)}
          sessionLabel={activeTerminalLabel}
          showScroll={false}
          scrollOverride={scrollOverride}
          position="static"
        />
        <div className={`relative min-h-0 min-w-0 ${resolvedView === "preview" ? "bg-black" : ""}`}>
          {statusLabel && resolvedView === "terminal" ? (
            <div
              className="terminal-status absolute inset-0 z-20 flex items-center justify-center bg-background/85 text-xs font-medium text-muted-foreground"
              role="status"
            >
              {statusLabel}
            </div>
          ) : null}
          {showPreview && resolvedView === "preview" ? (
            <iframe
              src={previewSrc}
              title="Preview"
              className="h-full w-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              data-testid="preview-iframe"
            />
          ) : null}
          <div
            ref={hostRef}
            className={`terminal-host h-full w-full ${resolvedView === "preview" ? "invisible absolute inset-0" : ""}`}
            data-testid="terminal-host"
          />
        </div>
        <TerminalControls
          clientRef={clientRef}
          terminals={terminals}
          activeTerminalId={activeTerminalId}
          activeTerminalSource={activeTerminalSource}
          activeView={resolvedView}
          onViewChange={setActiveView}
          showViewToggle={showPreview}
          onScrollAction={handleScrollAction}
          listState={state}
          onSelectTerminal={handleSelectTerminal}
          hideTerminalSwitcher={hideTerminalSwitcher}
        />
      </div>
    </div>
  );
};
