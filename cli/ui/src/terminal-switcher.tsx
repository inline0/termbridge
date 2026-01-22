import type { TerminalListItem } from "@termbridge/shared";
import { Terminal } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import type { TerminalListState } from "./terminal-list-state";
import { SheetHeader, SheetList, SheetOptionButton, SheetStatusMessage, SheetTriggerButton } from "./selection-sheet";

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
        <SheetTriggerButton
          label="Terminals"
          icon={<Terminal className="size-4" aria-hidden="true" />}
        />
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.View>
          <BottomSheet.Backdrop />
          <BottomSheet.Content className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3">
            <div className="flex items-center justify-center pb-3">
              <BottomSheet.Handle />
            </div>
            <SheetHeader
              eyebrow="Terminals"
              title="Select a session"
              countLabel={listState === "ready" ? `${terminals.length} total` : null}
            />
            <SheetList>
              {statusMessage ? (
                <SheetStatusMessage message={statusMessage} />
              ) : (
                terminals.map((terminal) => {
                  const isActive = terminal.id === activeTerminalId;
                  const label = terminal.label || terminal.id;
                  return (
                    <BottomSheet.Trigger key={terminal.id} asChild action="dismiss">
                      <SheetOptionButton
                        label={label}
                        description={getStatusLabel(terminal)}
                        active={isActive}
                        ariaLabel={`Open ${label}`}
                        onSelect={() => onSelectTerminal(terminal.id)}
                      />
                    </BottomSheet.Trigger>
                  );
                })
              )}
            </SheetList>
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
};
