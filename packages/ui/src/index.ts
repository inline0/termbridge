import { Button } from "./components/button";
import { Input } from "./components/input";
import { Textarea } from "./components/textarea";
import { getSystemTheme, useTheme } from "./hooks/use-theme";
import type { Theme } from "./hooks/use-theme";
import { cn } from "./lib/utils";

export { Button, Input, Textarea, getSystemTheme, useTheme, cn };
export type { Theme };

const exportsMarker = { Button, Input, Textarea, getSystemTheme, useTheme, cn };
void exportsMarker;
