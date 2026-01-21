import { Tabs, TabsList, TabsTrigger } from "@termbridge/ui";

export type ViewTabsProps = {
  activeView: "terminal" | "preview";
  onViewChange: (view: "terminal" | "preview") => void;
};

export const ViewTabs = ({ activeView, onViewChange }: ViewTabsProps) => {
  return (
    <Tabs
      value={activeView}
      onValueChange={(value) => onViewChange(value as "terminal" | "preview")}
      className="px-3 py-2"
    >
      <TabsList className="w-full">
        <TabsTrigger value="terminal" className="flex-1">
          Terminal
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex-1">
          Preview
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
