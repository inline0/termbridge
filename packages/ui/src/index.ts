import { Button } from "./components/button.tsx"
import { Input } from "./components/input.tsx"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
} from "./components/tabs.tsx"
import { Textarea } from "./components/textarea.tsx"
import { getSystemTheme, useTheme } from "./hooks/use-theme.ts"
import type { Theme } from "./hooks/use-theme.ts"
import { cn } from "./lib/utils.ts"

export {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
  Textarea,
  getSystemTheme,
  useTheme,
  cn,
}
export type { Theme }

const exportsMarker = {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
  Textarea,
  getSystemTheme,
  useTheme,
  cn,
}
void exportsMarker
