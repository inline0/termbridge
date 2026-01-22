import type { ConnectionState, ScrollInfo } from "./terminal-client";

type TerminalStatusBarProps = {
  connectionState: ConnectionState;
  scrollInfo: ScrollInfo;
  hasTerminal: boolean;
  sessionLabel?: string | null;
  showScroll?: boolean;
  scrollOverride?: { label: string; show: boolean };
  position?: "fixed" | "static";
  className?: string;
};

const connectionLabels: Record<ConnectionState, string> = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting"
};

const connectionColors: Record<ConnectionState, string> = {
  connected: "bg-emerald-500",
  connecting: "bg-sky-400",
  disconnected: "bg-rose-500",
  reconnecting: "bg-amber-400"
};

export const TerminalStatusBar = ({
  connectionState,
  scrollInfo,
  hasTerminal,
  sessionLabel,
  showScroll = true,
  scrollOverride,
  position = "fixed",
  className
}: TerminalStatusBarProps) => {
  const label = hasTerminal ? connectionLabels[connectionState] : "No session";
  const sessionText = hasTerminal ? (sessionLabel ?? "Session") : "No session";
  const dotClass = hasTerminal ? connectionColors[connectionState] : "bg-muted-foreground/50";
  const dotPulse =
    hasTerminal && (connectionState === "connecting" || connectionState === "reconnecting")
      ? "animate-pulse"
      : "";
  const viewportLine = Math.max(0, Math.round(scrollInfo.viewportY));
  const maxLine = Math.max(0, Math.round(scrollInfo.maxY));
  const scrollLabel = scrollOverride?.label ?? `${viewportLine} / ${maxLine}`;
  const shouldShowScroll =
    showScroll &&
    (scrollOverride?.show ?? (hasTerminal && maxLine > 0 && viewportLine < maxLine));

  const positionClasses =
    position === "fixed"
      ? "fixed left-0 right-0 top-0 z-20"
      : "relative z-10";

  return (
    <div
      className={`pointer-events-none flex items-center gap-3 bg-background/80 px-3 py-2 backdrop-blur-[2px] ${positionClasses} ${className ?? ""}`.trim()}
    >
      <div
        data-testid="session-status"
        className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
      >
        <span>{sessionText}</span>
      </div>
      {shouldShowScroll ? (
        <div
          data-testid="scroll-status"
          className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
        >
          <span className="text-xs text-muted-foreground">Scroll</span>
          <span>{scrollLabel}</span>
        </div>
      ) : null}
      <div
        data-testid="connection-status"
        data-state={hasTerminal ? connectionState : "idle"}
        className="ml-auto flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass} ${dotPulse}`} />
        <span>{label}</span>
      </div>
    </div>
  );
};
