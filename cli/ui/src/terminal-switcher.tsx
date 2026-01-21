import type { TerminalListItem } from "@termbridge/shared";
import { Button } from "@termbridge/ui";
import { Check, Terminal } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import type { TerminalListState } from "./terminal-list-state";

type TerminalSwitcherProps = {
  terminals: TerminalListItem[];
  activeTerminalId: string | null;
  listState: TerminalListState;
  onSelectTerminal: (terminalId: string) => void;
};

const getStatusLabel = (terminal: TerminalListItem) => {
  const statusLabel = terminal.status === "running" ? "Running" : "Closed";
  const sourceLabel = terminal.source === "tmux" ? "Tmux" : "Mock";
  return `${statusLabel} - ${sourceLabel}`;
};

export const TerminalSwitcher = ({
  terminals,
  activeTerminalId,
  listState,
  onSelectTerminal
}: TerminalSwitcherProps) => {
  const statusMessage =
    listState === "loading"
      ? "Loading terminals"
      : listState === "error"
        ? "Unable to load terminals"
        : listState === "empty"
          ? "No terminals available"
          : null;

  return (
    <BottomSheet.Root>
      <BottomSheet.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Terminals"
          className="h-11 w-11 rounded-full bg-input/50"
        >
          <Terminal className="size-4" aria-hidden="true" />
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.View>
          <BottomSheet.Backdrop />
          <BottomSheet.Content className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3">
            <div className="flex items-center justify-center pb-3">
              <BottomSheet.Handle />
            </div>
            <div className="flex items-center justify-between px-1 pb-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Terminals
                </p>
                <p className="text-sm font-medium text-foreground">Select a session</p>
              </div>
              {listState === "ready" ? (
                <span className="text-xs text-muted-foreground">{terminals.length} total</span>
              ) : null}
            </div>
            <div className="no-scrollbar max-h-[min(55vh,360px)] space-y-2 overflow-y-auto px-1">
              {statusMessage ? (
                <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
                  {statusMessage}
                </div>
              ) : (
                terminals.map((terminal) => {
                  const isActive = terminal.id === activeTerminalId;
                  const label = terminal.label || terminal.id;
                  return (
                    <BottomSheet.Trigger key={terminal.id} asChild action="dismiss">
                      <button
                        type="button"
                        aria-label={`Open ${label}`}
                        aria-current={isActive ? "page" : undefined}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-primary/60 bg-primary/10 text-foreground"
                            : "border-transparent bg-background/70 text-foreground hover:bg-background/90"
                        }`}
                        onClick={() => onSelectTerminal(terminal.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-sm font-medium">{label}</span>
                            <div className="pt-1 text-xs text-muted-foreground">
                              {getStatusLabel(terminal)}
                            </div>
                          </div>
                          {isActive ? (
                            <span className="flex h-8 w-8 items-center justify-center text-primary">
                              <Check className="size-6" aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </BottomSheet.Trigger>
                  );
                })
              )}
            </div>
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
};
