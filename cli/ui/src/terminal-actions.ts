import type { TerminalControlKey } from "@termbridge/shared";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Command,
  CornerDownLeft,
  X as XIcon
} from "lucide-react";

type ActionIcon = typeof ArrowUp;

export type TerminalAction =
  | {
      id: string;
      label: string;
      icon: ActionIcon;
      kind: "input";
      data: string;
    }
  | {
      id: string;
      label: string;
      icon: ActionIcon;
      kind: "control";
      key: TerminalControlKey;
    }
  | {
      id: string;
      label: string;
      icon: ActionIcon;
      kind: "scroll";
      mode: "lines" | "pages";
      amount: number;
    };

export const terminalActions: TerminalAction[] = [
  { id: "enter", label: "Enter", kind: "input", data: "\r", icon: CornerDownLeft },
  { id: "page-up", label: "Page Up", kind: "scroll", mode: "pages", amount: -1, icon: ChevronsUp },
  { id: "page-down", label: "Page Down", kind: "scroll", mode: "pages", amount: 1, icon: ChevronsDown },
  { id: "line-up", label: "Line Up", kind: "scroll", mode: "lines", amount: -1, icon: ChevronUp },
  { id: "line-down", label: "Line Down", kind: "scroll", mode: "lines", amount: 1, icon: ChevronDown },
  { id: "up", label: "Up", kind: "control", key: "up", icon: ArrowUp },
  { id: "down", label: "Down", kind: "control", key: "down", icon: ArrowDown },
  { id: "left", label: "Left", kind: "control", key: "left", icon: ArrowLeft },
  { id: "right", label: "Right", kind: "control", key: "right", icon: ArrowRight },
  { id: "tab", label: "Tab", kind: "control", key: "tab", icon: ArrowRightToLine },
  { id: "esc", label: "Esc", kind: "control", key: "esc", icon: XIcon },
  { id: "ctrl-c", label: "Ctrl+C", kind: "control", key: "ctrl_c", icon: Command }
];
