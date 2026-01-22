import { Monitor, Terminal } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { SheetHeader, SheetList, SheetOptionButton, SheetTriggerButton } from "./selection-sheet";

type ViewSwitcherProps = {
  activeView: "terminal" | "preview";
  onViewChange: (view: "terminal" | "preview") => void;
};

export const ViewSwitcher = ({ activeView, onViewChange }: ViewSwitcherProps) => {
  return (
    <BottomSheet.Root>
      <BottomSheet.Trigger asChild>
        <SheetTriggerButton
          label="Views"
          icon={<Monitor className="size-4" aria-hidden="true" />}
        />
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.View>
          <BottomSheet.Backdrop />
          <BottomSheet.Content className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3">
            <div className="flex items-center justify-center pb-3">
              <BottomSheet.Handle />
            </div>
            <SheetHeader eyebrow="Views" title="Choose your workspace" />
            <SheetList>
              <BottomSheet.Trigger asChild action="dismiss">
                <SheetOptionButton
                  label="Terminal"
                  description="Run commands and manage sessions"
                  active={activeView === "terminal"}
                  leading={<Terminal className="size-4" aria-hidden="true" />}
                  ariaLabel="Switch to Terminal"
                  onSelect={() => onViewChange("terminal")}
                />
              </BottomSheet.Trigger>
              <BottomSheet.Trigger asChild action="dismiss">
                <SheetOptionButton
                  label="Preview"
                  description="Open the live preview"
                  active={activeView === "preview"}
                  leading={<Monitor className="size-4" aria-hidden="true" />}
                  ariaLabel="Switch to Preview"
                  onSelect={() => onViewChange("preview")}
                />
              </BottomSheet.Trigger>
            </SheetList>
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
};
