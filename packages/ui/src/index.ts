import { Button } from "./components/button";
import { Input } from "./components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "./components/tabs";
import { Textarea } from "./components/textarea";
import { getSystemTheme, useTheme } from "./hooks/use-theme";
import type { Theme } from "./hooks/use-theme";
import { cn } from "./lib/utils";

export { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants, Textarea, getSystemTheme, useTheme, cn };
export type { Theme };

const exportsMarker = { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants, Textarea, getSystemTheme, useTheme, cn };
void exportsMarker;
