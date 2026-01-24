import type { TerminalListItem } from "@termbridge/shared";
import { Button, Input } from "@termbridge/ui";
import { PlusIcon, SendIcon } from "lucide-react";
import { type MutableRefObject, useEffect, useRef, useState } from "react";
import type { TerminalClient } from "./terminal-client";
import type { TerminalListState } from "./terminal-list-state";
import { TerminalSwitcher } from "./terminal-switcher";
import { ViewSwitcher } from "./view-switcher";
import { terminalActions, type TerminalAction } from "./terminal-actions";

type TerminalControlsProps = {
  clientRef: MutableRefObject<TerminalClient | null>;
  terminals: TerminalListItem[];
  activeTerminalId: string | null;
  activeTerminalSource?: TerminalListItem["source"] | null;
  activeView: "terminal" | "preview";
  onViewChange: (view: "terminal" | "preview") => void;
  showViewToggle?: boolean;
  onScrollAction?: (mode: "lines" | "pages", amount: number) => void;
  listState: TerminalListState;
  onSelectTerminal: (terminalId: string) => void;
  hideTerminalSwitcher?: boolean;
};

export const TerminalControls = ({
  clientRef,
  terminals,
  activeTerminalId,
  activeTerminalSource = null,
  activeView,
  onViewChange,
  showViewToggle = false,
  onScrollAction,
  listState,
  onSelectTerminal,
  hideTerminalSwitcher = false
}: TerminalControlsProps) => {
  const actionScrollRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!showActions) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const scrollEl = actionScrollRef.current as HTMLDivElement;

    const updateIndicators = () => {
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
      const left = scrollEl.scrollLeft > 0;
      const right = scrollEl.scrollLeft < maxScroll - 1;
      setCanScrollLeft(left);
      setCanScrollRight(maxScroll > 0 && right);
    };

    updateIndicators();

    const handleScroll = () => updateIndicators();
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });

    const ResizeObserverImpl = window.ResizeObserver;
    const observer =
      typeof ResizeObserverImpl === "function"
        ? new ResizeObserverImpl(updateIndicators)
        : null;
    observer?.observe(scrollEl);
    window.addEventListener("resize", updateIndicators);

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      observer?.disconnect();
      window.removeEventListener("resize", updateIndicators);
    };
  }, [showActions]);

  const handleSend = () => {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    if (message) {
      client.sendInput(message);
    }
    client.sendInput("\r");
    setMessage("");
  };

  const handleAction = (action: TerminalAction) => {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    if (action.kind === "input") {
      client.sendInput(action.data);
      return;
    }

    if (action.kind === "control") {
      client.sendControl(action.key);
      return;
    }

    onScrollAction?.(action.mode, action.amount);

    if (activeTerminalSource === "tmux") {
      client.sendScroll(action.mode, action.amount);
      return;
    }

    const scrollInfo = client.getScrollInfo();
    if (scrollInfo.maxY > 0) {
      if (action.mode === "lines") {
        client.scrollLines(action.amount);
        return;
      }
      client.scrollPages(action.amount);
      return;
    }

    client.sendScroll(action.mode, action.amount);
  };

  return (
    <div className="min-w-0">
      {showActions ? (
        <div className="pt-4">
          <div className="relative">
            <div className="h-auto">
              <div
                ref={actionScrollRef}
                id="terminal-actions"
                data-testid="terminal-actions-scroll"
                className="no-scrollbar flex h-full w-full items-center gap-2 overflow-x-auto px-3 snap-x snap-mandatory scroll-px-3"
              >
                {terminalActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      type="button"
                      variant="secondary"
                      size="sm"
                      aria-label={action.label}
                      className="bg-input/50 snap-start whitespace-nowrap px-3 py-2"
                      onClick={() => handleAction(action)}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span>{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            {canScrollLeft ? (
              <div
                data-testid="terminal-actions-gradient-left"
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
              />
            ) : null}
            {canScrollRight ? (
              <div
                data-testid="terminal-actions-gradient-right"
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
              />
            ) : null}
          </div>
        </div>
      ) : null}
      <div className={`px-2 pb-4 ${showActions ? "pt-2" : "pt-4"}`}>
        <div className="flex w-full min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Add"
            aria-expanded={showActions}
            aria-controls="terminal-actions"
            className="h-11 w-11 rounded-full bg-input/50"
            onClick={() => setShowActions((prev) => !prev)}
          >
            <PlusIcon
              className={`size-4 transition-transform duration-200 ${showActions ? "rotate-45" : ""}`}
            />
          </Button>
          <div className="relative flex-1 min-w-0">
            <Input
              placeholder="Message"
              aria-label="Message"
              className="h-11 rounded-full border-none bg-input/50 pl-4 pr-12"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              aria-label="Send"
              className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
              onClick={handleSend}
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
          <div className="-ml-1 flex flex-shrink-0 items-center gap-2">
            {hideTerminalSwitcher ? null : (
              <TerminalSwitcher
                terminals={terminals}
                activeTerminalId={activeTerminalId}
                listState={listState}
                onSelectTerminal={onSelectTerminal}
              />
            )}
            {showViewToggle ? (
              <ViewSwitcher activeView={activeView} onViewChange={onViewChange} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
