import { c as createRouter, a as createRootRoute, b as createFileRoute, l as lazyRouteComponent, O as Outlet, H as HeadContent, S as Scripts, u as useParams, d as useRouter$1, e as useRouterState, L as Link$3 } from "../_libs/@tanstack/react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as DirectionProvider } from "../_libs/@radix-ui/react-direction.mjs";
import { J, z } from "../_libs/next-themes.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { s as source, f as findPath, b as basename, e as extname, n as normalizeUrl } from "./source-BvNINj46.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as CollapsibleContent$1, R as Root$1, b as CollapsibleTrigger$1 } from "../_libs/@radix-ui/react-collapsible.mjs";
import { R as Root, C as Corner, V as Viewport, S as Scrollbar, a as ScrollAreaThumb } from "../_libs/@radix-ui/react-scroll-area.mjs";
import { P as Presence } from "../_libs/@radix-ui/react-presence.mjs";
import { e } from "../_libs/scroll-into-view-if-needed.mjs";
import { P as Portal, C as Content2, R as Root2$1, T as Trigger$1 } from "../_libs/@radix-ui/react-popover.mjs";
import { N as NavigationMenuItem$1, T as Trigger, C as Content, V as Viewport$1, R as Root2$2, L as List, a as Link$4 } from "../_libs/@radix-ui/react-navigation-menu.mjs";
import { T as TabsList$2, a as TabsTrigger$2, b as Tabs$2, c as TabsContent$2 } from "../_libs/@radix-ui/react-tabs.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./index.mjs";
import { R as Root2, I as Item, H as Header$1, T as Trigger2, C as Content2$1 } from "../_libs/@radix-ui/react-accordion.mjs";
import { T as TextAlignStart, F as FolderOpen, a as Folder$1, b as File$1, L as Lightbulb, C as CircleCheck, c as CircleX, d as TriangleAlert, I as Info, e as ChevronDown, f as ChevronRight, g as Check, h as Link$2, S as Smartphone, i as Terminal, j as Cloud, k as ShieldCheck, l as LayoutGrid, Z as Zap, m as Command, Q as QrCode, n as ChevronLeft, o as Clipboard, p as Search, q as Languages, P as PanelLeft, r as ChevronsUpDown, s as Sun, M as Moon, A as Airplay, E as ExternalLink } from "../_libs/lucide-react.mjs";
import { s as save, c as create$1, i as insertMultiple, a as search, g as getByID } from "../_libs/@orama/orama.mjs";
import { t as toJsxRuntime } from "../_libs/hast-util-to-jsx-runtime.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/clsx.mjs";
import "node:path";
import "../_libs/@radix-ui/primitive.mjs";
import "../_libs/@radix-ui/react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state.mjs";
import "../_libs/@radix-ui/react-use-layout-effect.mjs";
import "../_libs/@radix-ui/react-compose-refs.mjs";
import "../_libs/@radix-ui/react-primitive.mjs";
import "../_libs/@radix-ui/react-slot.mjs";
import "../_libs/@radix-ui/react-id.mjs";
import "../_libs/@radix-ui/react-use-callback-ref.mjs";
import "../_libs/@radix-ui/number.mjs";
import "../_libs/compute-scroll-into-view.mjs";
import "../_libs/@radix-ui/react-dismissable-layer.mjs";
import "../_libs/@radix-ui/react-use-escape-keydown.mjs";
import "../_libs/@radix-ui/react-focus-guards.mjs";
import "../_libs/@radix-ui/react-focus-scope.mjs";
import "../_libs/@radix-ui/react-popper.mjs";
import "../_libs/@floating-ui/react-dom.mjs";
import "../_libs/@floating-ui/dom.mjs";
import "../_libs/@floating-ui/core.mjs";
import "../_libs/@floating-ui/utils.mjs";
import "../_libs/@radix-ui/react-arrow.mjs";
import "../_libs/@radix-ui/react-use-size.mjs";
import "../_libs/@radix-ui/react-portal.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/@radix-ui/react-collection.mjs";
import "../_libs/@radix-ui/react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden.mjs";
import "../_libs/@radix-ui/react-roving-focus.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "../_libs/comma-separated-tokens.mjs";
import "../_libs/devlop.mjs";
import "../_libs/property-information.mjs";
import "../_libs/space-separated-tokens.mjs";
import "../_libs/style-to-js.mjs";
import "../_libs/style-to-object.mjs";
import "../_libs/inline-style-parser.mjs";
import "../_libs/hast-util-whitespace.mjs";
import "../_libs/estree-util-is-identifier-name.mjs";
import "../_libs/vfile-message.mjs";
import "../_libs/unist-util-stringify-position.mjs";
import "../_libs/unist-util-position.mjs";
const notImplemented = () => {
  throw new Error("You need to wrap your application inside `FrameworkProvider`.");
};
const FrameworkContext = reactExports.createContext({
  useParams: notImplemented,
  useRouter: notImplemented,
  usePathname: notImplemented
});
function FrameworkProvider({ Link: Link$12, useRouter: useRouter$12, useParams: useParams$1, usePathname: usePathname$12, Image: Image$12, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FrameworkContext, {
    value: reactExports.useMemo(() => ({
      usePathname: usePathname$12,
      useRouter: useRouter$12,
      Link: Link$12,
      Image: Image$12,
      useParams: useParams$1
    }), [
      Link$12,
      usePathname$12,
      useRouter$12,
      useParams$1,
      Image$12
    ]),
    children
  });
}
function usePathname$1() {
  return reactExports.use(FrameworkContext).usePathname();
}
function useRouter() {
  return reactExports.use(FrameworkContext).useRouter();
}
function Image(props) {
  const { Image: Image$12 } = reactExports.use(FrameworkContext);
  if (!Image$12) {
    const { src, alt, priority, ...rest } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
      alt,
      src,
      fetchPriority: priority ? "high" : "auto",
      ...rest
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Image$12, { ...props });
}
function Link$1(props) {
  const { Link: Link$12 } = reactExports.use(FrameworkContext);
  if (!Link$12) {
    const { href, prefetch: _, ...rest } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
      href,
      ...rest
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link$12, { ...props });
}
const defaultTranslations = {
  search: "Search",
  searchNoResult: "No results found",
  toc: "On this page",
  tocNoHeadings: "No Headings",
  lastUpdate: "Last updated on",
  chooseLanguage: "Choose a language",
  nextPage: "Next Page",
  previousPage: "Previous Page",
  chooseTheme: "Theme",
  editOnGithub: "Edit on GitHub"
};
const I18nContext = reactExports.createContext({ text: defaultTranslations });
function I18nLabel(props) {
  const { text } = useI18n();
  return text[props.label];
}
function useI18n() {
  return reactExports.useContext(I18nContext);
}
function I18nProvider({ locales = [], locale, onLocaleChange, children, translations }) {
  const router2 = useRouter();
  const pathname = usePathname$1();
  const onChange = (value) => {
    if (onLocaleChange) return onLocaleChange(value);
    const segments = pathname.split("/").filter((v) => v.length > 0);
    if (segments[0] !== locale) segments.unshift(value);
    else segments[0] = value;
    router2.push(`/${segments.join("/")}`);
  };
  const onChangeRef = reactExports.useRef(onChange);
  onChangeRef.current = onChange;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(I18nContext, {
    value: reactExports.useMemo(() => ({
      locale,
      locales,
      text: {
        ...defaultTranslations,
        ...translations
      },
      onChange: (v) => onChangeRef.current(v)
    }), [
      locale,
      locales,
      translations
    ]),
    children
  });
}
const import__fumadocs_ui_contexts_i18n = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  I18nLabel,
  I18nProvider,
  defaultTranslations,
  useI18n
}, Symbol.toStringTag, { value: "Module" }));
const SearchContext = reactExports.createContext({
  enabled: false,
  hotKey: [],
  setOpenSearch: () => void 0
});
function useSearchContext() {
  return reactExports.use(SearchContext);
}
function MetaOrControl() {
  const [key, setKey] = reactExports.useState("⌘");
  reactExports.useEffect(() => {
    if (window.navigator.userAgent.includes("Windows")) setKey("Ctrl");
  }, []);
  return key;
}
function SearchProvider({ SearchDialog, children, preload = true, options, hotKey = [{
  key: (e2) => e2.metaKey || e2.ctrlKey,
  display: /* @__PURE__ */ jsxRuntimeExports.jsx(MetaOrControl, {})
}, {
  key: "k",
  display: "K"
}], links }) {
  const [isOpen, setIsOpen] = reactExports.useState(preload ? false : void 0);
  const onKeyDown = reactExports.useEffectEvent((e2) => {
    if (hotKey.every((v) => typeof v.key === "string" ? e2.key === v.key : v.key(e2))) {
      setIsOpen((open) => !open);
      e2.preventDefault();
    }
  });
  reactExports.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hotKey]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SearchContext, {
    value: reactExports.useMemo(() => ({
      enabled: true,
      hotKey,
      setOpenSearch: setIsOpen
    }), [hotKey]),
    children: [isOpen !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
      fallback: null,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDialog, {
        open: isOpen,
        onOpenChange: setIsOpen,
        links,
        ...options
      })
    }), children]
  });
}
function SearchOnly({ children }) {
  if (useSearchContext().enabled) return children;
}
const import__fumadocs_ui_contexts_search = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SearchOnly,
  SearchProvider,
  useSearchContext
}, Symbol.toStringTag, { value: "Module" }));
const DefaultSearchDialog = reactExports.lazy(() => import("./search-default--KRiV0te.mjs"));
function RootProvider$1({ children, dir = "ltr", theme = {}, search: search2, i18n }) {
  let body = children;
  if (search2?.enabled !== false) body = /* @__PURE__ */ jsxRuntimeExports.jsx(SearchProvider, {
    SearchDialog: DefaultSearchDialog,
    ...search2,
    children: body
  });
  if (theme?.enabled !== false) body = /* @__PURE__ */ jsxRuntimeExports.jsx(J, {
    attribute: "class",
    defaultTheme: "system",
    enableSystem: true,
    disableTransitionOnChange: true,
    ...theme,
    children: body
  });
  if (i18n) body = /* @__PURE__ */ jsxRuntimeExports.jsx(I18nProvider, {
    ...i18n,
    children: body
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionProvider, {
    dir,
    children: body
  });
}
const framework = {
  Link({ href, prefetch = true, ...props }) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Link$3, {
      to: href,
      preload: prefetch ? "intent" : false,
      ...props,
      children: props.children
    });
  },
  usePathname() {
    const { isLoading, pathname } = useRouterState({ select: (state) => ({
      isLoading: state.isLoading,
      pathname: state.location.pathname
    }) });
    const activePathname = reactExports.useRef(pathname);
    return reactExports.useMemo(() => {
      if (isLoading) return activePathname.current;
      activePathname.current = pathname;
      return pathname;
    }, [isLoading, pathname]);
  },
  useRouter() {
    const router2 = useRouter$1();
    return reactExports.useMemo(() => ({
      push(url) {
        router2.navigate({ href: url });
      },
      refresh() {
        router2.invalidate();
      }
    }), [router2]);
  },
  useParams() {
    return useParams({ strict: false });
  }
};
function TanstackProvider({ children, Link: CustomLink, Image: CustomImage }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FrameworkProvider, {
    ...framework,
    Link: CustomLink ?? framework.Link,
    Image: CustomImage ?? framework.Image,
    children
  });
}
function RootProvider({ components, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TanstackProvider, {
    Link: components?.Link,
    Image: components?.Image,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RootProvider$1, {
      ...props,
      children: props.children
    })
  });
}
function RootLayout({ children }) {
  return jsxRuntimeExports.jsx(FrameworkProvider, { Link: FrameworkLink, usePathname, useRouter: useFrameworkRouter, useParams: useFrameworkParams, children: jsxRuntimeExports.jsx(RootProvider, { children }) });
}
function FrameworkLink({ href, prefetch = true, ...props }) {
  return jsxRuntimeExports.jsx(Link$3, { to: href ?? "#", preload: prefetch ? "intent" : false, ...props, children: props.children });
}
function usePathname() {
  const { isLoading, pathname } = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      pathname: state.location.pathname
    })
  });
  const activePathname = reactExports.useRef(pathname);
  return reactExports.useMemo(() => {
    if (isLoading)
      return activePathname.current;
    activePathname.current = pathname;
    return pathname;
  }, [isLoading, pathname]);
}
function useFrameworkRouter() {
  const router2 = useRouter$1();
  return reactExports.useMemo(() => ({
    push(url) {
      router2.navigate({ href: url });
    },
    refresh() {
      router2.invalidate();
    }
  }), [router2]);
}
function useFrameworkParams() {
  return useParams({ strict: false });
}
const variants = {
  primary: "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80",
  outline: "border hover:bg-fd-accent hover:text-fd-accent-foreground",
  ghost: "hover:bg-fd-accent hover:text-fd-accent-foreground",
  secondary: "border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
};
const buttonVariants = cva("inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring", { variants: {
  variant: variants,
  color: variants,
  size: {
    sm: "gap-1 px-2 py-1.5 text-xs",
    icon: "p-1.5 [&_svg]:size-5",
    "icon-sm": "p-1.5 [&_svg]:size-4.5",
    "icon-xs": "p-1 [&_svg]:size-4"
  }
} });
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget);
function getBreadcrumbItemsFromPath(tree, path, options) {
  const { includePage = false, includeSeparator = false, includeRoot = false } = options;
  let items = [];
  for (let i = 0; i < path.length; i++) {
    const item = path[i];
    switch (item.type) {
      case "page":
        if (includePage) items.push({
          name: item.name,
          url: item.url
        });
        break;
      case "folder":
        if (item.root && !includeRoot) {
          items = [];
          break;
        }
        if (i === path.length - 1 || item.index !== path[i + 1]) items.push({
          name: item.name,
          url: item.index?.url
        });
        break;
      case "separator":
        if (item.name && includeSeparator) items.push({ name: item.name });
        break;
    }
  }
  if (includeRoot) items.unshift({
    name: tree.name,
    url: typeof includeRoot === "object" ? includeRoot.url : void 0
  });
  return items;
}
function searchPath(nodes, url) {
  const normalizedUrl = normalizeUrl(url);
  return findPath(nodes, (node) => node.type === "page" && node.url === normalizedUrl);
}
const TreeContext = reactExports.createContext(null);
const PathContext = reactExports.createContext([]);
function TreeContextProvider({ tree: rawTree, children }) {
  const nextIdRef = reactExports.useRef(0);
  const pathname = usePathname$1();
  const tree = reactExports.useMemo(() => rawTree, [rawTree.$id ?? rawTree]);
  const path = reactExports.useMemo(() => {
    return searchPath(tree.children, pathname) ?? (tree.fallback ? searchPath(tree.fallback.children, pathname) : null) ?? [];
  }, [tree, pathname]);
  const root = path.findLast((item) => item.type === "folder" && item.root) ?? tree;
  root.$id ??= String(nextIdRef.current++);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TreeContext, {
    value: reactExports.useMemo(() => ({
      root,
      full: tree
    }), [root, tree]),
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(PathContext, {
      value: path,
      children
    })
  });
}
function useTreePath() {
  return reactExports.use(PathContext);
}
function useTreeContext() {
  const ctx = reactExports.use(TreeContext);
  if (!ctx) throw new Error("You must wrap this component under <DocsLayout />");
  return ctx;
}
const import__fumadocs_ui_contexts_tree = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TreeContextProvider,
  useTreeContext,
  useTreePath
}, Symbol.toStringTag, { value: "Module" }));
var tree_exports = {};
__reExport(tree_exports, import__fumadocs_ui_contexts_tree);
const Collapsible = Root$1;
const CollapsibleTrigger = CollapsibleTrigger$1;
const CollapsibleContent = reactExports.forwardRef(({ children, ...props }, ref) => {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent$1, {
    ref,
    ...props,
    className: twMerge("overflow-hidden", mounted && "data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down", props.className),
    children
  });
});
CollapsibleContent.displayName = CollapsibleContent$1.displayName;
const ScrollArea = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Root, {
  ref,
  type: "scroll",
  className: twMerge("overflow-hidden", className),
  ...props,
  children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, { orientation: "vertical" })
  ]
}));
ScrollArea.displayName = Root.displayName;
const ScrollViewport = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, {
  ref,
  className: twMerge("size-full rounded-[inherit]", className),
  ...props,
  children
}));
ScrollViewport.displayName = Viewport.displayName;
const ScrollBar = reactExports.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Scrollbar, {
  ref,
  orientation,
  className: twMerge("flex select-none data-[state=hidden]:animate-fd-fade-out", orientation === "vertical" && "h-full w-1.5", orientation === "horizontal" && "h-1.5 flex-col", className),
  ...props,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-fd-border" })
}));
ScrollBar.displayName = Scrollbar.displayName;
const Link = reactExports.forwardRef(({ href = "#", external = href.match(/^\w+:/) || href.startsWith("//"), prefetch, children, ...props }, ref) => {
  if (external) return /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
    ref,
    href,
    rel: "noreferrer noopener",
    target: "_blank",
    ...props,
    children
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, {
    ref,
    href,
    prefetch,
    ...props,
    children
  });
});
Link.displayName = "Link";
function normalize(urlOrPath) {
  if (urlOrPath.length > 1 && urlOrPath.endsWith("/")) return urlOrPath.slice(0, -1);
  return urlOrPath;
}
function isActive(href, pathname, nested = true) {
  href = normalize(href);
  pathname = normalize(pathname);
  return href === pathname || nested && pathname.startsWith(`${href}/`);
}
function isDifferent(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return b.length !== a.length || a.some((v, i) => isDifferent(v, b[i]));
  return a !== b;
}
function useOnChange(value, onChange, isUpdated = isDifferent) {
  const [prev, setPrev] = reactExports.useState(value);
  if (isUpdated(prev, value)) {
    onChange(value, prev);
    setPrev(value);
  }
}
function useMediaQuery(query, disabled = false) {
  const [isMatch, setMatch] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (disabled) return;
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => {
      setMatch(mediaQueryList.matches);
    };
    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [disabled, query]);
  return isMatch;
}
const SidebarContext = reactExports.createContext(null);
const FolderContext = reactExports.createContext(null);
function SidebarProvider({ defaultOpenLevel = 0, prefetch, children }) {
  const closeOnRedirect = reactExports.useRef(true);
  const [open, setOpen] = reactExports.useState(false);
  const [collapsed, setCollapsed] = reactExports.useState(false);
  const pathname = usePathname$1();
  const mode = useMediaQuery("(width < 768px)") ? "drawer" : "full";
  useOnChange(pathname, () => {
    if (closeOnRedirect.current) setOpen(false);
    closeOnRedirect.current = true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContext, {
    value: reactExports.useMemo(() => ({
      open,
      setOpen,
      collapsed,
      setCollapsed,
      closeOnRedirect,
      defaultOpenLevel,
      prefetch,
      mode
    }), [
      open,
      collapsed,
      defaultOpenLevel,
      prefetch,
      mode
    ]),
    children
  });
}
function useSidebar() {
  const ctx = reactExports.use(SidebarContext);
  if (!ctx) throw new Error("Missing SidebarContext, make sure you have wrapped the component in <DocsLayout /> and the context is available.");
  return ctx;
}
function useFolder() {
  return reactExports.use(FolderContext);
}
function useFolderDepth() {
  return reactExports.use(FolderContext)?.depth ?? 0;
}
function SidebarContent$1({ children }) {
  const { collapsed, mode } = useSidebar();
  const [hover, setHover] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  const timerRef = reactExports.useRef(0);
  useOnChange(collapsed, () => {
    if (collapsed) setHover(false);
  });
  if (mode !== "full") return;
  function shouldIgnoreHover(e2) {
    const element = ref.current;
    if (!element) return true;
    return !collapsed || e2.pointerType === "touch" || element.getAnimations().length > 0;
  }
  return children({
    ref,
    collapsed,
    hovered: hover,
    onPointerEnter(e2) {
      if (shouldIgnoreHover(e2)) return;
      window.clearTimeout(timerRef.current);
      setHover(true);
    },
    onPointerLeave(e2) {
      if (shouldIgnoreHover(e2)) return;
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setHover(false), Math.min(e2.clientX, document.body.clientWidth - e2.clientX) > 100 ? 0 : 500);
    }
  });
}
function SidebarDrawerOverlay(props) {
  const { open, setOpen, mode } = useSidebar();
  if (mode !== "drawer") return;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, {
    present: open,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      "data-state": open ? "open" : "closed",
      onClick: () => setOpen(false),
      ...props
    })
  });
}
function SidebarDrawerContent({ className, children, ...props }) {
  const { open, mode } = useSidebar();
  const state = open ? "open" : "closed";
  if (mode !== "drawer") return;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, {
    present: open,
    children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx("aside", {
      id: "nd-sidebar-mobile",
      "data-state": state,
      className: twMerge(!present && "invisible", className),
      ...props,
      children
    })
  });
}
function SidebarViewport(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, {
    ...props,
    className: twMerge("min-h-0 flex-1", props.className),
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollViewport, {
      className: "p-4 overscroll-contain",
      style: { maskImage: "linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)" },
      children: props.children
    })
  });
}
function SidebarSeparator$1(props) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
    ...props,
    className: twMerge("inline-flex items-center gap-2 mb-1.5 px-2 mt-6 empty:mb-0", depth === 0 && "first:mt-0", props.className),
    children: props.children
  });
}
function SidebarItem$1({ icon, children, ...props }) {
  const pathname = usePathname$1();
  const ref = reactExports.useRef(null);
  const { prefetch } = useSidebar();
  const active = props.href !== void 0 && isActive(props.href, pathname, false);
  useAutoScroll(active, ref);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
    ref,
    "data-active": active,
    prefetch,
    ...props,
    children: [icon ?? (props.external ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, {}) : null), children]
  });
}
function SidebarFolder({ defaultOpen: defaultOpenProp, collapsible = true, active = false, children, ...props }) {
  const { defaultOpenLevel } = useSidebar();
  const depth = useFolderDepth() + 1;
  const defaultOpen = collapsible === false || active || (defaultOpenProp ?? defaultOpenLevel >= depth);
  const [open, setOpen] = reactExports.useState(defaultOpen);
  useOnChange(defaultOpen, (v) => {
    if (v) setOpen(v);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, {
    open,
    onOpenChange: setOpen,
    disabled: !collapsible,
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderContext, {
      value: reactExports.useMemo(() => ({
        open,
        setOpen,
        depth,
        collapsible
      }), [
        collapsible,
        depth,
        open
      ]),
      children
    })
  });
}
function SidebarFolderTrigger$1({ children, ...props }) {
  const { open, collapsible } = reactExports.use(FolderContext);
  if (collapsible) return /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsibleTrigger, {
    ...props,
    children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, {
      "data-icon": true,
      className: twMerge("ms-auto transition-transform", !open && "-rotate-90")
    })]
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    children
  });
}
function SidebarFolderLink$1({ children, ...props }) {
  const ref = reactExports.useRef(null);
  const { open, setOpen, collapsible } = reactExports.use(FolderContext);
  const { prefetch } = useSidebar();
  const pathname = usePathname$1();
  const active = props.href !== void 0 && isActive(props.href, pathname, false);
  useAutoScroll(active, ref);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
    ref,
    "data-active": active,
    onClick: (e2) => {
      if (!collapsible) return;
      if (e2.target instanceof Element && e2.target.matches("[data-icon], [data-icon] *")) {
        setOpen(!open);
        e2.preventDefault();
      } else setOpen(active ? !open : true);
    },
    prefetch,
    ...props,
    children: [children, collapsible && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, {
      "data-icon": true,
      className: twMerge("ms-auto transition-transform", !open && "-rotate-90")
    })]
  });
}
function SidebarFolderContent$1(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, {
    ...props,
    children: props.children
  });
}
function SidebarTrigger({ children, ...props }) {
  const { setOpen } = useSidebar();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    "aria-label": "Open Sidebar",
    onClick: () => setOpen((prev) => !prev),
    ...props,
    children
  });
}
function SidebarCollapseTrigger(props) {
  const { collapsed, setCollapsed } = useSidebar();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    type: "button",
    "aria-label": "Collapse Sidebar",
    "data-collapsed": collapsed,
    onClick: () => {
      setCollapsed((prev) => !prev);
    },
    ...props,
    children: props.children
  });
}
function useAutoScroll(active, ref) {
  const { mode } = useSidebar();
  reactExports.useEffect(() => {
    if (active && ref.current) e(ref.current, {
      boundary: document.getElementById(mode === "drawer" ? "nd-sidebar-mobile" : "nd-sidebar"),
      scrollMode: "if-needed"
    });
  }, [
    active,
    mode,
    ref
  ]);
}
const Popover = Root2$1;
const PopoverTrigger = Trigger$1;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Content2, {
  ref,
  align,
  sideOffset,
  side: "bottom",
  className: twMerge("z-50 origin-(--radix-popover-content-transform-origin) overflow-y-auto max-h-(--radix-popover-content-available-height) min-w-[240px] max-w-[98vw] rounded-xl border bg-fd-popover/60 backdrop-blur-lg p-2 text-sm text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in", className),
  ...props
}) }));
PopoverContent.displayName = Content2.displayName;
function SidebarTabsDropdown({ options, placeholder, ...props }) {
  const [open, setOpen] = reactExports.useState(false);
  const { closeOnRedirect } = useSidebar();
  const pathname = usePathname$1();
  const selected = reactExports.useMemo(() => {
    return options.findLast((item$1) => isTabActive(item$1, pathname));
  }, [options, pathname]);
  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };
  const item = selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "size-9 shrink-0 empty:hidden md:size-5",
    children: selected.icon
  }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
    className: "text-sm font-medium",
    children: selected.title
  }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
    className: "text-sm text-fd-muted-foreground empty:hidden md:hidden",
    children: selected.description
  })] })] }) : placeholder;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, {
    open,
    onOpenChange: setOpen,
    children: [item && /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverTrigger, {
      ...props,
      className: twMerge("flex items-center gap-2 rounded-lg p-2 border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground", props.className),
      children: [item, /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "shrink-0 ms-auto size-4 text-fd-muted-foreground" })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, {
      className: "flex flex-col gap-1 w-(--radix-popover-trigger-width) p-1 fd-scroll-container",
      children: options.map((item$1) => {
        const isActive$1 = selected && item$1.url === selected.url;
        if (!isActive$1 && item$1.unlisted) return;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
          href: item$1.url,
          onClick,
          ...item$1.props,
          className: twMerge("flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground", item$1.props?.className),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
              className: "shrink-0 size-9 md:mb-auto md:size-5 empty:hidden",
              children: item$1.icon
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-sm font-medium leading-none",
              children: item$1.title
            }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-[0.8125rem] text-fd-muted-foreground mt-1 empty:hidden",
              children: item$1.description
            })] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: twMerge("shrink-0 ms-auto size-3.5 text-fd-primary", !isActive$1 && "invisible") })
          ]
        }, item$1.url);
      })
    })]
  });
}
function isTabActive(tab, pathname) {
  if (tab.urls) return tab.urls.has(normalize(pathname));
  return isActive(tab.url, pathname, true);
}
function useIsScrollTop({ enabled = true }) {
  const [isTop, setIsTop] = reactExports.useState();
  reactExports.useEffect(() => {
    if (!enabled) return;
    const listener = () => {
      setIsTop(window.scrollY < 10);
    };
    listener();
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, [enabled]);
  return isTop;
}
const LayoutContext = reactExports.createContext(null);
function LayoutContextProvider({ navTransparentMode = "none", children }) {
  const isTop = useIsScrollTop({ enabled: navTransparentMode === "top" }) ?? true;
  const isNavTransparent = navTransparentMode === "top" ? isTop : navTransparentMode === "always";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutContext, {
    value: reactExports.useMemo(() => ({ isNavTransparent }), [isNavTransparent]),
    children
  });
}
function LayoutHeader(props) {
  const { isNavTransparent } = reactExports.use(LayoutContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", {
    "data-transparent": isNavTransparent,
    ...props,
    children: props.children
  });
}
function LayoutBody({ className, style, children, ...props }) {
  const { collapsed } = useSidebar();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    id: "nd-docs-layout",
    className: twMerge("grid transition-[grid-template-columns] overflow-x-clip min-h-(--fd-docs-height) auto-cols-auto auto-rows-auto [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px]", className),
    "data-sidebar-collapsed": collapsed,
    style: {
      gridTemplate: `"sidebar header toc"
        "sidebar toc-popover toc"
        "sidebar main toc" 1fr / minmax(var(--fd-sidebar-col), 1fr) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-width) - var(--fd-toc-width))) minmax(min-content, 1fr)`,
      "--fd-docs-row-1": "var(--fd-banner-height, 0px)",
      "--fd-docs-row-2": "calc(var(--fd-docs-row-1) + var(--fd-header-height))",
      "--fd-docs-row-3": "calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height))",
      "--fd-sidebar-col": collapsed ? "0px" : "var(--fd-sidebar-width)",
      ...style
    },
    ...props,
    children
  });
}
function LayoutTabs({ options, ...props }) {
  const pathname = usePathname$1();
  const selected = reactExports.useMemo(() => {
    return options.findLast((option) => isTabActive(option, pathname));
  }, [options, pathname]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    className: twMerge("flex flex-row items-end gap-6 overflow-auto [grid-area:main]", props.className),
    children: options.map((option, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
      href: option.url,
      className: twMerge("inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground", option.unlisted && selected !== option && "hidden", selected === option && "border-fd-primary text-fd-primary"),
      children: option.title
    }, i))
  });
}
var i18n_exports = {};
__reExport(i18n_exports, import__fumadocs_ui_contexts_i18n);
var search_exports = {};
__reExport(search_exports, import__fumadocs_ui_contexts_search);
function SearchToggle({ hideIfDisabled, size = "icon-sm", color = "ghost", ...props }) {
  const { setOpenSearch, enabled } = (0, search_exports.useSearchContext)();
  if (hideIfDisabled && !enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    type: "button",
    className: twMerge(buttonVariants({
      size,
      color
    }), props.className),
    "data-search": "",
    "aria-label": "Open Search",
    onClick: () => {
      setOpenSearch(true);
    },
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, {})
  });
}
function LargeSearchToggle({ hideIfDisabled, ...props }) {
  const { enabled, hotKey, setOpenSearch } = (0, search_exports.useSearchContext)();
  const { text } = (0, i18n_exports.useI18n)();
  if (hideIfDisabled && !enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
    type: "button",
    "data-search-full": "",
    ...props,
    className: twMerge("inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground", props.className),
    onClick: () => {
      setOpenSearch(true);
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4" }),
      text.search,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "ms-auto inline-flex gap-0.5",
        children: hotKey.map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", {
          className: "rounded-md border bg-fd-background px-1.5",
          children: k.display
        }, i))
      })
    ]
  });
}
function createLinkItemRenderer({ SidebarFolder: SidebarFolder2, SidebarFolderContent: SidebarFolderContent2, SidebarFolderLink: SidebarFolderLink2, SidebarFolderTrigger: SidebarFolderTrigger2, SidebarItem: SidebarItem2 }) {
  return function SidebarLinkItem2({ item, ...props }) {
    if (item.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      ...props,
      children: item.children
    });
    if (item.type === "menu") return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolder2, {
      ...props,
      children: [item.url ? /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderLink2, {
        href: item.url,
        external: item.external,
        children: [item.icon, item.text]
      }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderTrigger2, { children: [item.icon, item.text] }), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderContent2, { children: item.items.map((child, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarLinkItem2, { item: child }, i)) })]
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarItem2, {
      href: item.url,
      icon: item.icon,
      external: item.external,
      ...props,
      children: item.text
    });
  };
}
function createPageTreeRenderer({ SidebarFolder: SidebarFolder2, SidebarFolderContent: SidebarFolderContent2, SidebarFolderLink: SidebarFolderLink2, SidebarFolderTrigger: SidebarFolderTrigger2, SidebarSeparator: SidebarSeparator2, SidebarItem: SidebarItem2 }) {
  function PageTreeFolder({ item, children }) {
    const path = (0, tree_exports.useTreePath)();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolder2, {
      collapsible: item.collapsible,
      active: path.includes(item),
      defaultOpen: item.defaultOpen,
      children: [item.index ? /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderLink2, {
        href: item.index.url,
        external: item.index.external,
        children: [item.icon, item.name]
      }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarFolderTrigger2, { children: [item.icon, item.name] }), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderContent2, { children })]
    });
  }
  return function SidebarPageTree2(components) {
    const { root } = (0, tree_exports.useTreeContext)();
    const { Separator, Item: Item2, Folder: Folder2 = PageTreeFolder } = components;
    return reactExports.useMemo(() => {
      function renderSidebarList(items) {
        return items.map((item, i) => {
          if (item.type === "separator") {
            if (Separator) return /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { item }, i);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarSeparator2, { children: [item.icon, item.name] }, i);
          }
          if (item.type === "folder") return /* @__PURE__ */ jsxRuntimeExports.jsx(Folder2, {
            item,
            children: renderSidebarList(item.children)
          }, i);
          if (Item2) return /* @__PURE__ */ jsxRuntimeExports.jsx(Item2, { item }, item.url);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarItem2, {
            href: item.url,
            external: item.external,
            icon: item.icon,
            children: item.name
          }, item.url);
        });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: renderSidebarList(root.children) }, root.$id);
    }, [
      Folder2,
      Item2,
      Separator,
      root
    ]);
  };
}
function mergeRefs$1(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref) ref.current = value;
    });
  };
}
const itemVariants$2 = cva("relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0", { variants: {
  variant: {
    link: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
    button: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none"
  },
  highlight: { true: "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5" }
} });
function getItemOffset$1(depth) {
  return `calc(${2 + 3 * depth} * var(--spacing))`;
}
function SidebarContent({ ref: refProp, className, children, ...props }) {
  const ref = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent$1, { children: ({ collapsed, hovered, ref: asideRef, ...rest }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    "data-sidebar-placeholder": "",
    className: "sticky top-(--fd-docs-row-1) z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden",
    children: [collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "absolute start-0 inset-y-0 w-4",
      ...rest
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("aside", {
      id: "nd-sidebar",
      ref: mergeRefs$1(ref, refProp, asideRef),
      "data-collapsed": collapsed,
      "data-hovered": collapsed && hovered,
      className: twMerge("absolute flex flex-col w-full start-0 inset-y-0 items-end bg-fd-card text-sm border-e duration-250 *:w-(--fd-sidebar-width)", collapsed && ["inset-y-2 rounded-xl transition-transform border w-(--fd-sidebar-width)", hovered ? "shadow-lg translate-x-2 rtl:-translate-x-2" : "-translate-x-(--fd-sidebar-width) rtl:translate-x-full"], ref.current && ref.current.getAttribute("data-collapsed") === "true" !== collapsed && "transition-[width,inset-block,translate,background-color]", className),
      ...props,
      ...rest,
      children
    })]
  }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    "data-sidebar-panel": "",
    className: twMerge("fixed flex top-[calc(--spacing(4)+var(--fd-docs-row-3))] start-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10", (!collapsed || hovered) && "pointer-events-none opacity-0"),
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SidebarCollapseTrigger, {
      className: twMerge(buttonVariants({
        color: "ghost",
        size: "icon-sm",
        className: "rounded-lg"
      })),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(SearchToggle, {
      className: "rounded-lg",
      hideIfDisabled: true
    })]
  })] }) });
}
function SidebarDrawer({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SidebarDrawerOverlay, { className: "fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" }), /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarDrawerContent, {
    className: twMerge("fixed text-[0.9375rem] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out", className),
    ...props,
    children
  })] });
}
function SidebarSeparator({ className, style, children, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarSeparator$1, {
    className: twMerge("[&_svg]:size-4 [&_svg]:shrink-0", className),
    style: {
      paddingInlineStart: getItemOffset$1(depth),
      ...style
    },
    ...props,
    children
  });
}
function SidebarItem({ className, style, children, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarItem$1, {
    className: twMerge(itemVariants$2({
      variant: "link",
      highlight: depth >= 1
    }), className),
    style: {
      paddingInlineStart: getItemOffset$1(depth),
      ...style
    },
    ...props,
    children
  });
}
function SidebarFolderTrigger({ className, style, ...props }) {
  const { depth, collapsible } = useFolder();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderTrigger$1, {
    className: twMerge(itemVariants$2({ variant: collapsible ? "button" : null }), "w-full", className),
    style: {
      paddingInlineStart: getItemOffset$1(depth - 1),
      ...style
    },
    ...props,
    children: props.children
  });
}
function SidebarFolderLink({ className, style, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderLink$1, {
    className: twMerge(itemVariants$2({
      variant: "link",
      highlight: depth > 1
    }), "w-full", className),
    style: {
      paddingInlineStart: getItemOffset$1(depth - 1),
      ...style
    },
    ...props,
    children: props.children
  });
}
function SidebarFolderContent({ className, children, ...props }) {
  const depth = useFolderDepth();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFolderContent$1, {
    className: twMerge("relative", depth === 1 && "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5", className),
    ...props,
    children
  });
}
const SidebarPageTree = createPageTreeRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator
});
const SidebarLinkItem = createLinkItemRenderer({
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem
});
function resolveLinkItems({ links = [], githubUrl }) {
  const result = [...links];
  if (githubUrl) result.push({
    type: "icon",
    url: githubUrl,
    text: "Github",
    label: "GitHub",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", {
      role: "img",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" })
    }),
    external: true
  });
  return result;
}
function renderTitleNav({ title, url = "/" }, props) {
  if (typeof title === "function") return title({
    href: url,
    ...props
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
    href: url,
    ...props,
    children: title
  });
}
function LanguageToggle(props) {
  const context = (0, i18n_exports.useI18n)();
  if (!context.locales) throw new Error("Missing `<I18nProvider />`");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, {
    "aria-label": context.text.chooseLanguage,
    ...props,
    className: twMerge(buttonVariants({
      color: "ghost",
      className: "gap-1.5 p-1.5"
    }), props.className),
    children: props.children
  }), /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, {
    className: "flex flex-col overflow-x-hidden p-0",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
      className: "mb-1 p-2 text-xs font-medium text-fd-muted-foreground",
      children: context.text.chooseLanguage
    }), context.locales.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      type: "button",
      className: twMerge("p-2 text-start text-sm", item.locale === context.locale ? "bg-fd-primary/10 font-medium text-fd-primary" : "hover:bg-fd-accent hover:text-fd-accent-foreground"),
      onClick: () => {
        context.onChange?.(item.locale);
      },
      children: item.name
    }, item.locale))]
  })] });
}
function LanguageToggleText(props) {
  const context = (0, i18n_exports.useI18n)();
  const text = context.locales?.find((item) => item.locale === context.locale)?.name;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
    ...props,
    children: text
  });
}
const itemVariants$1 = cva("size-6.5 rounded-full p-1.5 text-fd-muted-foreground", { variants: { active: {
  true: "bg-fd-accent text-fd-accent-foreground",
  false: "text-fd-muted-foreground"
} } });
const full = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Airplay]
];
function ThemeToggle({ className, mode = "light-dark", ...props }) {
  const { setTheme, theme, resolvedTheme } = z();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  const container = twMerge("inline-flex items-center rounded-full border p-1", className);
  if (mode === "light-dark") {
    const value$1 = mounted ? resolvedTheme : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      className: container,
      "aria-label": `Toggle Theme`,
      onClick: () => setTheme(value$1 === "light" ? "dark" : "light"),
      "data-theme-toggle": "",
      children: full.map(([key, Icon]) => {
        if (key === "system") return;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {
          fill: "currentColor",
          className: twMerge(itemVariants$1({ active: value$1 === key }))
        }, key);
      })
    });
  }
  const value = mounted ? theme : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: container,
    "data-theme-toggle": "",
    ...props,
    children: full.map(([key, Icon]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      "aria-label": key,
      className: twMerge(itemVariants$1({ active: value === key })),
      onClick: () => setTheme(key),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {
        className: "size-full",
        fill: "currentColor"
      })
    }, key))
  });
}
function LinkItem({ ref, item, ...props }) {
  const pathname = usePathname$1();
  const activeType = item.active ?? "url";
  const active = activeType !== "none" && isActive(item.url, pathname, activeType === "nested-url");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
    ref,
    href: item.url,
    external: item.external,
    ...props,
    "data-active": active,
    children: props.children
  });
}
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref != null) ref.current = value;
    });
  };
}
const ActiveAnchorContext = reactExports.createContext([]);
const ScrollContext = reactExports.createContext({ current: null });
function useActiveAnchor() {
  return reactExports.useContext(ActiveAnchorContext)[0];
}
function useActiveAnchors() {
  return reactExports.useContext(ActiveAnchorContext);
}
function ScrollProvider({ containerRef, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollContext.Provider, {
    value: containerRef,
    children
  });
}
function AnchorProvider({ toc, single = false, children }) {
  const headings = reactExports.useMemo(() => {
    return toc.map((item) => item.url.split("#")[1]);
  }, [toc]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveAnchorContext.Provider, {
    value: useAnchorObserver(headings, single),
    children
  });
}
function TOCItem$2({ ref, onActiveChange = () => null, ...props }) {
  const containerRef = reactExports.useContext(ScrollContext);
  const anchorRef = reactExports.useRef(null);
  const activeOrder = useActiveAnchors().indexOf(props.href.slice(1));
  const isActive2 = activeOrder !== -1;
  const shouldScroll = activeOrder === 0;
  const onActiveChangeEvent = reactExports.useEffectEvent(onActiveChange);
  reactExports.useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const container = containerRef.current;
    if (container && anchor && shouldScroll) e(anchor, {
      behavior: "smooth",
      block: "center",
      inline: "center",
      scrollMode: "always",
      boundary: container
    });
  }, [containerRef, shouldScroll]);
  reactExports.useEffect(() => {
    return () => onActiveChangeEvent(isActive2);
  }, [isActive2]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("a", {
    ref: mergeRefs(anchorRef, ref),
    "data-active": isActive2,
    ...props,
    children: props.children
  });
}
function useAnchorObserver(watch, single) {
  const observerRef = reactExports.useRef(null);
  const [activeAnchor, setActiveAnchor] = reactExports.useState(() => []);
  const stateRef = reactExports.useRef(null);
  const onChange = reactExports.useEffectEvent((entries) => {
    stateRef.current ??= { visible: /* @__PURE__ */ new Set() };
    const state = stateRef.current;
    for (const entry of entries) if (entry.isIntersecting) state.visible.add(entry.target.id);
    else state.visible.delete(entry.target.id);
    if (state.visible.size === 0) {
      const viewTop = entries.length > 0 ? entries[0]?.rootBounds?.top ?? 0 : 0;
      let fallback;
      let min = -1;
      for (const id of watch) {
        const element = document.getElementById(id);
        if (!element) continue;
        const d = Math.abs(viewTop - element.getBoundingClientRect().top);
        if (min === -1 || d < min) {
          fallback = element;
          min = d;
        }
      }
      setActiveAnchor(fallback ? [fallback.id] : []);
    } else {
      const items = watch.filter((item) => state.visible.has(item));
      setActiveAnchor(single ? items.slice(0, 1) : items);
    }
  });
  reactExports.useEffect(() => {
    if (observerRef.current) return;
    observerRef.current = new IntersectionObserver(onChange, {
      rootMargin: "0px",
      threshold: 0.98
    });
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);
  reactExports.useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;
    const elements = watch.flatMap((heading) => document.getElementById(heading) ?? []);
    for (const element of elements) observer.observe(element);
    return () => {
      for (const element of elements) observer.unobserve(element);
    };
  }, [watch]);
  return activeAnchor;
}
const TOCContext = reactExports.createContext([]);
function useTOCItems() {
  return reactExports.use(TOCContext);
}
function TOCProvider({ toc, children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TOCContext, {
    value: toc,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnchorProvider, {
      toc,
      ...props,
      children
    })
  });
}
function TOCScrollArea({ ref, className, ...props }) {
  const viewRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ref: mergeRefs$1(viewRef, ref),
    className: twMerge("relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollProvider, {
      containerRef: viewRef,
      children: props.children
    })
  });
}
function TocThumb({ containerRef, ...props }) {
  const thumbRef = reactExports.useRef(null);
  const active = useActiveAnchors();
  function update(info) {
    const element = thumbRef.current;
    if (!element) return;
    element.style.setProperty("--fd-top", `${info[0]}px`);
    element.style.setProperty("--fd-height", `${info[1]}px`);
  }
  const onPrint = reactExports.useEffectEvent(() => {
    if (containerRef.current) update(calc(containerRef.current, active));
  });
  reactExports.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const observer = new ResizeObserver(onPrint);
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);
  useOnChange(active, () => {
    if (containerRef.current) update(calc(containerRef.current, active));
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ref: thumbRef,
    "data-hidden": active.length === 0,
    ...props
  });
}
function calc(container, active) {
  if (active.length === 0 || container.clientHeight === 0) return [0, 0];
  let upper = Number.MAX_VALUE, lower = 0;
  for (const item of active) {
    const element = container.querySelector(`a[href="#${item}"]`);
    if (!element) continue;
    const styles = getComputedStyle(element);
    upper = Math.min(upper, element.offsetTop + parseFloat(styles.paddingTop));
    lower = Math.max(lower, element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom));
  }
  return [upper, lower - upper];
}
const import__fumadocs_ui_components_toc_index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TOCProvider,
  TOCScrollArea,
  TocThumb,
  useTOCItems
}, Symbol.toStringTag, { value: "Module" }));
var toc_exports = {};
__reExport(toc_exports, import__fumadocs_ui_components_toc_index);
const footerCache = /* @__PURE__ */ new Map();
function useFooterItems() {
  const { root } = useTreeContext();
  const cached = footerCache.get(root.$id);
  if (cached) return cached;
  const list = [];
  function onNode(node) {
    if (node.type === "folder") {
      if (node.index) onNode(node.index);
      for (const child of node.children) onNode(child);
    } else if (node.type === "page" && !node.external) list.push(node);
  }
  for (const child of root.children) onNode(child);
  footerCache.set(root.$id, list);
  return list;
}
const TocPopoverContext = reactExports.createContext(null);
function PageTOCPopover({ className, children, ...rest }) {
  const ref = reactExports.useRef(null);
  const [open, setOpen] = reactExports.useState(false);
  const { isNavTransparent } = reactExports.use(LayoutContext);
  const onClick = reactExports.useEffectEvent((e2) => {
    if (!open) return;
    if (ref.current && !ref.current.contains(e2.target)) setOpen(false);
  });
  reactExports.useEffect(() => {
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TocPopoverContext, {
    value: reactExports.useMemo(() => ({
      open,
      setOpen
    }), [setOpen, open]),
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, {
      open,
      onOpenChange: setOpen,
      "data-toc-popover": "",
      className: twMerge("sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]", className),
      ...rest,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("header", {
        ref,
        className: twMerge("border-b backdrop-blur-sm transition-colors", (!isNavTransparent || open) && "bg-fd-background/80", open && "shadow-lg"),
        children
      })
    })
  });
}
function PageTOCPopoverTrigger({ className, ...props }) {
  const { text } = (0, i18n_exports.useI18n)();
  const { open } = reactExports.use(TocPopoverContext);
  const items = (0, toc_exports.useTOCItems)();
  const active = useActiveAnchor();
  const selected = reactExports.useMemo(() => items.findIndex((item) => active === item.url.slice(1)), [items, active]);
  const path = (0, tree_exports.useTreePath)().at(-1);
  const showItem = selected !== -1 && !open;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsibleTrigger, {
    className: twMerge("flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6", className),
    "data-toc-popover-trigger": "",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressCircle, {
        value: (selected + 1) / Math.max(1, items.length),
        max: 1,
        className: twMerge("shrink-0", open && "text-fd-primary")
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", {
        className: "grid flex-1 *:my-auto *:row-start-1 *:col-start-1",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("span", {
          className: twMerge("truncate transition-[opacity,translate,color]", open && "text-fd-foreground", showItem && "opacity-0 -translate-y-full pointer-events-none"),
          children: path?.name ?? text.toc
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
          className: twMerge("truncate transition-[opacity,translate]", !showItem && "opacity-0 translate-y-full pointer-events-none"),
          children: items[selected]?.title
        })]
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: twMerge("shrink-0 transition-transform mx-0.5", open && "rotate-180") })
    ]
  });
}
function clamp(input, min, max) {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}
function ProgressCircle({ value, strokeWidth = 2, size = 24, min = 0, max = 100, ...restSvgProps }) {
  const normalizedValue = clamp(value, min, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = normalizedValue / max * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", {
    role: "progressbar",
    viewBox: `0 0 ${size} ${size}`,
    "aria-valuenow": normalizedValue,
    "aria-valuemin": min,
    "aria-valuemax": max,
    ...restSvgProps,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      ...circleProps,
      className: "stroke-current/25"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      ...circleProps,
      stroke: "currentColor",
      strokeDasharray: circumference,
      strokeDashoffset: circumference - progress,
      strokeLinecap: "round",
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
      className: "transition-all"
    })]
  });
}
function PageTOCPopoverContent(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, {
    "data-toc-popover-content": "",
    ...props,
    className: twMerge("flex flex-col px-4 max-h-[50vh] md:px-6", props.className),
    children: props.children
  });
}
function PageFooter({ items, children, className, ...props }) {
  const footerList = useFooterItems();
  const pathname = usePathname$1();
  const { previous, next } = reactExports.useMemo(() => {
    if (items) return items;
    const idx = footerList.findIndex((item) => isActive(item.url, pathname, false));
    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1]
    };
  }, [
    footerList,
    items,
    pathname
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: twMerge("@container grid gap-4", previous && next ? "grid-cols-2" : "grid-cols-1", className),
    ...props,
    children: [previous && /* @__PURE__ */ jsxRuntimeExports.jsx(FooterItem, {
      item: previous,
      index: 0
    }), next && /* @__PURE__ */ jsxRuntimeExports.jsx(FooterItem, {
      item: next,
      index: 1
    })]
  }), children] });
}
function FooterItem({ item, index }) {
  const { text } = (0, i18n_exports.useI18n)();
  const Icon = index === 0 ? ChevronLeft : ChevronRight;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, {
    href: item.url,
    className: twMerge("flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full", index === 1 && "text-end"),
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: twMerge("inline-flex items-center gap-1.5 font-medium", index === 1 && "flex-row-reverse"),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "-mx-1 size-4 shrink-0 rtl:rotate-180" }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.name })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
      className: "text-fd-muted-foreground truncate",
      children: item.description ?? (index === 0 ? text.previousPage : text.nextPage)
    })]
  });
}
function PageBreadcrumb({ includeRoot, includeSeparator, includePage, ...props }) {
  const path = (0, tree_exports.useTreePath)();
  const { root } = (0, tree_exports.useTreeContext)();
  const items = reactExports.useMemo(() => {
    return getBreadcrumbItemsFromPath(root, path, {
      includePage,
      includeSeparator,
      includeRoot
    });
  }, [
    includePage,
    includeRoot,
    includeSeparator,
    path,
    root
  ]);
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    className: twMerge("flex items-center gap-1.5 text-sm text-fd-muted-foreground", props.className),
    children: items.map((item, i) => {
      const className = twMerge("truncate", i === items.length - 1 && "text-fd-primary font-medium");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [i !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3.5 shrink-0" }), item.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        href: item.url,
        className: twMerge(className, "transition-opacity hover:opacity-80"),
        children: item.name
      }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
        className,
        children: item.name
      })] }, i);
    })
  });
}
function TOCItems$1({ ref, className, ...props }) {
  const containerRef = reactExports.useRef(null);
  const items = useTOCItems();
  const { text } = useI18n();
  if (items.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground",
    children: text.tocNoHeadings
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(TocThumb, {
    containerRef,
    className: "absolute top-(--fd-top) h-(--fd-height) w-0.5 rounded-e-sm bg-fd-primary transition-[top,height] ease-linear"
  }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ref: mergeRefs$1(ref, containerRef),
    className: twMerge("flex flex-col border-s border-fd-foreground/10", className),
    ...props,
    children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(TOCItem$1, { item }, item.url))
  })] });
}
function TOCItem$1({ item }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TOCItem$2, {
    href: item.url,
    className: twMerge("prose py-1.5 text-sm text-fd-muted-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary", item.depth <= 2 && "ps-3", item.depth === 3 && "ps-6", item.depth >= 4 && "ps-8"),
    children: item.title
  });
}
const import__fumadocs_ui_components_toc_default = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TOCItems: TOCItems$1
}, Symbol.toStringTag, { value: "Module" }));
var default_exports = {};
__reExport(default_exports, import__fumadocs_ui_components_toc_default);
function TOCItems({ ref, className, ...props }) {
  const containerRef = reactExports.useRef(null);
  const items = useTOCItems();
  const { text } = useI18n();
  const [svg, setSvg] = reactExports.useState();
  reactExports.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    function onResize() {
      if (container.clientHeight === 0) return;
      let w = 0, h = 0;
      const d = [];
      for (let i = 0; i < items.length; i++) {
        const element = container.querySelector(`a[href="#${items[i].url.slice(1)}"]`);
        if (!element) continue;
        const styles = getComputedStyle(element);
        const offset = getLineOffset(items[i].depth) + 1, top = element.offsetTop + parseFloat(styles.paddingTop), bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);
        w = Math.max(offset, w);
        h = Math.max(h, bottom);
        d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`);
        d.push(`L${offset} ${bottom}`);
      }
      setSvg({
        path: d.join(" "),
        width: w + 1,
        height: h
      });
    }
    const observer = new ResizeObserver(onResize);
    onResize();
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [items]);
  if (items.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground",
    children: text.tocNoHeadings
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [svg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "absolute start-0 top-0 rtl:-scale-x-100",
    style: {
      width: svg.width,
      height: svg.height,
      maskImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`)}")`
    },
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TocThumb, {
      containerRef,
      className: "absolute w-full top-(--fd-top) h-(--fd-height) bg-fd-primary transition-[top,height]"
    })
  }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ref: mergeRefs$1(containerRef, ref),
    className: twMerge("flex flex-col", className),
    ...props,
    children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TOCItem, {
      item,
      upper: items[i - 1]?.depth,
      lower: items[i + 1]?.depth
    }, item.url))
  })] });
}
function getItemOffset(depth) {
  if (depth <= 2) return 14;
  if (depth === 3) return 26;
  return 36;
}
function getLineOffset(depth) {
  return depth >= 3 ? 10 : 0;
}
function TOCItem({ item, upper = item.depth, lower = item.depth }) {
  const offset = getLineOffset(item.depth), upperOffset = getLineOffset(upper), lowerOffset = getLineOffset(lower);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TOCItem$2, {
    href: item.url,
    style: { paddingInlineStart: getItemOffset(item.depth) },
    className: "prose relative py-1.5 text-sm text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary",
    children: [
      offset !== upperOffset && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 16 16",
        className: "absolute -top-1.5 start-0 size-4 rtl:-scale-x-100",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("line", {
          x1: upperOffset,
          y1: "0",
          x2: offset,
          y2: "12",
          className: "stroke-fd-foreground/10",
          strokeWidth: "1"
        })
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: twMerge("absolute inset-y-0 w-px bg-fd-foreground/10", offset !== upperOffset && "top-1.5", offset !== lowerOffset && "bottom-1.5"),
        style: { insetInlineStart: offset }
      }),
      item.title
    ]
  });
}
const import__fumadocs_ui_components_toc_clerk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TOCItems
}, Symbol.toStringTag, { value: "Module" }));
var clerk_exports = {};
__reExport(clerk_exports, import__fumadocs_ui_components_toc_clerk);
function DocsPage({ breadcrumb: { enabled: breadcrumbEnabled = true, component: breadcrumb, ...breadcrumbProps } = {}, footer: { enabled: footerEnabled, component: footerReplace, ...footerProps } = {}, full: full2 = false, tableOfContentPopover: { enabled: tocPopoverEnabled, component: tocPopover, ...tocPopoverOptions } = {}, tableOfContent: { enabled: tocEnabled, component: tocReplace, ...tocOptions } = {}, toc = [], children, className }) {
  tocEnabled ??= !full2 && (toc.length > 0 || tocOptions.footer !== void 0 || tocOptions.header !== void 0);
  tocPopoverEnabled ??= toc.length > 0 || tocPopoverOptions.header !== void 0 || tocPopoverOptions.footer !== void 0;
  let wrapper = (children$1) => children$1;
  if (tocEnabled || tocPopoverEnabled) wrapper = (children$1) => /* @__PURE__ */ jsxRuntimeExports.jsx(toc_exports.TOCProvider, {
    single: tocOptions.single,
    toc,
    children: children$1
  });
  return wrapper(/* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    tocPopoverEnabled && (tocPopover ?? /* @__PURE__ */ jsxRuntimeExports.jsxs(PageTOCPopover, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(PageTOCPopoverTrigger, {}), /* @__PURE__ */ jsxRuntimeExports.jsxs(PageTOCPopoverContent, { children: [
      tocPopoverOptions.header,
      /* @__PURE__ */ jsxRuntimeExports.jsx(toc_exports.TOCScrollArea, { children: tocPopoverOptions.style === "clerk" ? /* @__PURE__ */ jsxRuntimeExports.jsx(clerk_exports.TOCItems, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(default_exports.TOCItems, {}) }),
      tocPopoverOptions.footer
    ] })] })),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("article", {
      id: "nd-page",
      "data-full": full2,
      className: twMerge("flex flex-col w-full max-w-[900px] mx-auto [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14", full2 ? "max-w-[1200px]" : "xl:layout:[--fd-toc-width:268px]", className),
      children: [
        breadcrumbEnabled && (breadcrumb ?? /* @__PURE__ */ jsxRuntimeExports.jsx(PageBreadcrumb, { ...breadcrumbProps })),
        children,
        footerEnabled !== false && (footerReplace ?? /* @__PURE__ */ jsxRuntimeExports.jsx(PageFooter, { ...footerProps }))
      ]
    }),
    tocEnabled && (tocReplace ?? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      id: "nd-toc",
      className: "sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 max-xl:hidden",
      children: [
        tocOptions.header,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", {
          id: "toc-title",
          className: "inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(TextAlignStart, { className: "size-4" }), /* @__PURE__ */ jsxRuntimeExports.jsx(i18n_exports.I18nLabel, { label: "toc" })]
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(toc_exports.TOCScrollArea, { children: tocOptions.style === "clerk" ? /* @__PURE__ */ jsxRuntimeExports.jsx(clerk_exports.TOCItems, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(default_exports.TOCItems, {}) }),
        tocOptions.footer
      ]
    }))
  ] }));
}
function DocsBody({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    className: twMerge("prose flex-1", className),
    children
  });
}
function DocsDescription({ children, className, ...props }) {
  if (children === void 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
    ...props,
    className: twMerge("mb-8 text-lg text-fd-muted-foreground", className),
    children
  });
}
function DocsTitle({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
    ...props,
    className: twMerge("text-[1.75em] font-semibold", className),
    children
  });
}
reactExports.createContext(null);
reactExports.createContext(null);
const NavigationMenu = Root2$2;
const NavigationMenuList = List;
const NavigationMenuItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuItem$1, {
  ref,
  className: twMerge("list-none", className),
  ...props,
  children
}));
NavigationMenuItem.displayName = NavigationMenuItem$1.displayName;
const NavigationMenuTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, {
  ref,
  className: twMerge("data-[state=open]:bg-fd-accent/50", className),
  ...props,
  children
}));
NavigationMenuTrigger.displayName = Trigger.displayName;
const NavigationMenuContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Content, {
  ref,
  className: twMerge("absolute inset-x-0 top-0 overflow-auto fd-scroll-container max-h-[80svh] data-[motion=from-end]:animate-fd-enterFromRight data-[motion=from-start]:animate-fd-enterFromLeft data-[motion=to-end]:animate-fd-exitToRight data-[motion=to-start]:animate-fd-exitToLeft", className),
  ...props
}));
NavigationMenuContent.displayName = Content.displayName;
const NavigationMenuLink = Link$4;
const NavigationMenuViewport = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
  ref,
  className: "flex w-full justify-center",
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport$1, {
    ...props,
    className: twMerge("relative h-(--radix-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden transition-[width,height] duration-300 data-[state=closed]:animate-fd-nav-menu-out data-[state=open]:animate-fd-nav-menu-in", className)
  })
}));
NavigationMenuViewport.displayName = Viewport$1.displayName;
const navItemVariants = cva("[&_svg]:size-4", {
  variants: { variant: {
    main: "inline-flex items-center gap-1 p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary",
    button: buttonVariants({
      color: "secondary",
      className: "gap-1.5"
    }),
    icon: buttonVariants({
      color: "ghost",
      size: "icon"
    })
  } },
  defaultVariants: { variant: "main" }
});
function Header({ nav = {}, i18n = false, links, githubUrl, themeSwitch = {}, searchToggle = {} }) {
  const { navItems, menuItems } = reactExports.useMemo(() => {
    const navItems$1 = [];
    const menuItems$1 = [];
    for (const item of resolveLinkItems({
      links,
      githubUrl
    })) switch (item.on ?? "all") {
      case "menu":
        menuItems$1.push(item);
        break;
      case "nav":
        navItems$1.push(item);
        break;
      default:
        navItems$1.push(item);
        menuItems$1.push(item);
    }
    return {
      navItems: navItems$1,
      menuItems: menuItems$1
    };
  }, [links, githubUrl]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(HeaderNavigationMenu, {
    transparentMode: nav.transparentMode,
    children: [
      renderTitleNav(nav, { className: "inline-flex items-center gap-2.5 font-semibold" }),
      nav.children,
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
        className: "flex flex-row items-center gap-2 px-6 max-sm:hidden",
        children: navItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLinkItem, {
          item,
          className: "text-sm"
        }, i))
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden",
        children: [
          searchToggle.enabled !== false && (searchToggle.components?.lg ?? /* @__PURE__ */ jsxRuntimeExports.jsx(LargeSearchToggle, {
            className: "w-full rounded-full ps-2.5 max-w-[240px]",
            hideIfDisabled: true
          })),
          themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, { mode: themeSwitch?.mode })),
          i18n && /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageToggle, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
            className: "flex flex-row gap-2 items-center empty:hidden",
            children: navItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLinkItem, {
              className: twMerge(item.type === "icon" && "-mx-1 first:ms-0 last:me-0"),
              item
            }, i))
          })
        ]
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", {
        className: "flex flex-row items-center ms-auto -me-1.5 lg:hidden",
        children: [searchToggle.enabled !== false && (searchToggle.components?.sm ?? /* @__PURE__ */ jsxRuntimeExports.jsx(SearchToggle, {
          className: "p-2",
          hideIfDisabled: true
        })), /* @__PURE__ */ jsxRuntimeExports.jsxs(NavigationMenuItem, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuTrigger, {
          "aria-label": "Toggle Menu",
          className: twMerge(buttonVariants({
            size: "icon",
            color: "ghost",
            className: "group [&_svg]:size-5.5"
          })),
          onPointerMove: nav.enableHoverToOpen ? void 0 : (e2) => e2.preventDefault(),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "transition-transform duration-300 group-data-[state=open]:rotate-180" })
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs(NavigationMenuContent, {
          className: "flex flex-col p-4 sm:flex-row sm:items-center sm:justify-end",
          children: [menuItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNavigationMenuLinkItem, {
            item,
            className: "sm:hidden"
          }, i)), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "-ms-1.5 flex flex-row items-center gap-2 max-sm:mt-2",
            children: [
              menuItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNavigationMenuLinkItem, {
                item,
                className: twMerge(item.type === "icon" && "-mx-1 first:ms-0")
              }, i)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                role: "separator",
                className: "flex-1"
              }),
              i18n && /* @__PURE__ */ jsxRuntimeExports.jsxs(LanguageToggle, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageToggleText, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3 text-fd-muted-foreground" })
              ] }),
              themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, { mode: themeSwitch?.mode }))
            ]
          })]
        })] })]
      })
    ]
  });
}
function isSecondary(item) {
  if ("secondary" in item && item.secondary != null) return item.secondary;
  return item.type === "icon";
}
function HeaderNavigationMenu({ transparentMode = "none", ...props }) {
  const [value, setValue] = reactExports.useState("");
  const isTop = useIsScrollTop({ enabled: transparentMode === "top" }) ?? true;
  const isTransparent = transparentMode === "top" ? isTop : transparentMode === "always";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenu, {
    value,
    onValueChange: setValue,
    asChild: true,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      id: "nd-nav",
      ...props,
      className: twMerge("sticky h-14 top-0 z-40", props.className),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: twMerge("backdrop-blur-lg border-b transition-colors *:mx-auto *:max-w-(--fd-layout-width)", value.length > 0 && "max-lg:shadow-lg max-lg:rounded-b-2xl", (!isTransparent || value.length > 0) && "bg-fd-background/80"),
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuList, {
          className: "flex h-14 w-full items-center px-4",
          asChild: true,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { children: props.children })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuViewport, {})]
      })
    })
  });
}
function NavigationMenuLinkItem({ item, ...props }) {
  if (item.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    children: item.children
  });
  if (item.type === "menu") {
    const children = item.items.map((child, j) => {
      if (child.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: child.children }, j);
      const { banner = child.icon ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4",
        children: child.icon
      }) : null, ...rest } = child.menu ?? {};
      return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
        asChild: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          href: child.url,
          external: child.external,
          ...rest,
          className: twMerge("flex flex-col gap-2 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground", rest.className),
          children: rest.children ?? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            banner,
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-base font-medium",
              children: child.text
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-sm text-fd-muted-foreground empty:hidden",
              children: child.description
            })
          ] })
        })
      }, `${j}-${child.url}`);
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(NavigationMenuItem, {
      ...props,
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuTrigger, {
        className: twMerge(navItemVariants(), "rounded-md"),
        children: item.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
          href: item.url,
          external: item.external,
          children: item.text
        }) : item.text
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuContent, {
        className: "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3",
        children
      })]
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuItem, {
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
      asChild: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkItem, {
        item,
        "aria-label": item.type === "icon" ? item.label : void 0,
        className: twMerge(navItemVariants({ variant: item.type })),
        children: item.type === "icon" ? item.icon : item.text
      })
    })
  });
}
function MobileNavigationMenuLinkItem({ item, ...props }) {
  if (item.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: twMerge("grid", props.className),
    children: item.children
  });
  if (item.type === "menu") {
    const header = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [item.icon, item.text] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: twMerge("mb-4 flex flex-col", props.className),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "mb-1 text-sm text-fd-muted-foreground",
        children: item.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
          asChild: true,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
            href: item.url,
            external: item.external,
            children: header
          })
        }) : header
      }), item.items.map((child, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNavigationMenuLinkItem, { item: child }, i))]
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
    asChild: true,
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LinkItem, {
      item,
      className: twMerge({
        main: "inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4",
        icon: buttonVariants({
          size: "icon",
          color: "ghost"
        }),
        button: buttonVariants({
          color: "secondary",
          className: "gap-1.5 [&_svg]:size-4"
        })
      }[item.type ?? "main"], props.className),
      "aria-label": item.type === "icon" ? item.label : void 0,
      children: [item.icon, item.type === "icon" ? void 0 : item.text]
    })
  });
}
const listeners = /* @__PURE__ */ new Map();
const TabsContext$2 = reactExports.createContext(null);
function useTabContext$1() {
  const ctx = reactExports.use(TabsContext$2);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}
const TabsList$1 = TabsList$2;
const TabsTrigger$1 = TabsTrigger$2;
function Tabs$1({ ref, groupId, persist = false, updateAnchor = false, defaultValue, value: _value, onValueChange: _onValueChange, ...props }) {
  const tabsRef = reactExports.useRef(null);
  const valueToIdMap = reactExports.useMemo(() => /* @__PURE__ */ new Map(), []);
  const [value, setValue] = _value === void 0 ? reactExports.useState(defaultValue) : [_value, reactExports.useEffectEvent((v) => _onValueChange?.(v))];
  reactExports.useLayoutEffect(() => {
    if (!groupId) return;
    let previous = sessionStorage.getItem(groupId);
    if (persist) previous ??= localStorage.getItem(groupId);
    if (previous) setValue(previous);
    const groupListeners = listeners.get(groupId) ?? /* @__PURE__ */ new Set();
    groupListeners.add(setValue);
    listeners.set(groupId, groupListeners);
    return () => {
      groupListeners.delete(setValue);
    };
  }, [
    groupId,
    persist,
    setValue
  ]);
  reactExports.useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    for (const [value$1, id] of valueToIdMap.entries()) if (id === hash) {
      setValue(value$1);
      tabsRef.current?.scrollIntoView();
      break;
    }
  }, [setValue, valueToIdMap]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs$2, {
    ref: mergeRefs$1(ref, tabsRef),
    value,
    onValueChange: (v) => {
      if (updateAnchor) {
        const id = valueToIdMap.get(v);
        if (id) window.history.replaceState(null, "", `#${id}`);
      }
      if (groupId) {
        const groupListeners = listeners.get(groupId);
        if (groupListeners) for (const listener of groupListeners) listener(v);
        sessionStorage.setItem(groupId, v);
        if (persist) localStorage.setItem(groupId, v);
      } else setValue(v);
    },
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContext$2, {
      value: reactExports.useMemo(() => ({ valueToIdMap }), [valueToIdMap]),
      children: props.children
    })
  });
}
function TabsContent$1({ value, ...props }) {
  const { valueToIdMap } = useTabContext$1();
  if (props.id) valueToIdMap.set(value, props.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent$2, {
    value,
    ...props,
    children: props.children
  });
}
const TabsContext$1 = reactExports.createContext(null);
function useTabContext() {
  const ctx = reactExports.useContext(TabsContext$1);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}
const TabsList = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList$1, {
  ref,
  ...props,
  className: twMerge("flex gap-3.5 text-fd-secondary-foreground overflow-x-auto px-4 not-prose", props.className)
}));
TabsList.displayName = "TabsList";
const TabsTrigger = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger$1, {
  ref,
  ...props,
  className: twMerge("inline-flex items-center gap-2 whitespace-nowrap text-fd-muted-foreground border-b border-transparent py-2 text-sm font-medium transition-colors [&_svg]:size-4 hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary", props.className)
}));
TabsTrigger.displayName = "TabsTrigger";
function Tabs({ ref, className, items, label, defaultIndex = 0, defaultValue = items ? escapeValue(items[defaultIndex]) : void 0, ...props }) {
  const [value, setValue] = reactExports.useState(defaultValue);
  const collection = reactExports.useMemo(() => [], []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs$1, {
    ref,
    className: twMerge("flex flex-col overflow-hidden rounded-xl border bg-fd-secondary my-4", className),
    value,
    onValueChange: (v) => {
      if (items && !items.some((item) => escapeValue(item) === v)) return;
      setValue(v);
    },
    ...props,
    children: [items && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [label && /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
      className: "text-sm font-medium my-auto me-auto",
      children: label
    }), items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, {
      value: escapeValue(item),
      children: item
    }, item))] }), /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContext$1.Provider, {
      value: reactExports.useMemo(() => ({
        items,
        collection
      }), [collection, items]),
      children: props.children
    })]
  });
}
function Tab({ value, ...props }) {
  const { items } = useTabContext();
  const resolved = value ?? items?.at(useCollectionIndex());
  if (!resolved) throw new Error("Failed to resolve tab `value`, please pass a `value` prop to the Tab component.");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, {
    value: escapeValue(resolved),
    ...props,
    children: props.children
  });
}
function TabsContent({ value, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent$1, {
    value,
    forceMount: true,
    className: twMerge("p-4 text-[0.9375rem] bg-fd-background rounded-xl outline-none prose-no-margin data-[state=inactive]:hidden [&>figure:only-child]:-m-4 [&>figure:only-child]:border-none", className),
    ...props,
    children: props.children
  });
}
function useCollectionIndex() {
  const key = reactExports.useId();
  const { collection } = useTabContext();
  reactExports.useEffect(() => {
    return () => {
      const idx = collection.indexOf(key);
      if (idx !== -1) collection.splice(idx, 1);
    };
  }, [key, collection]);
  if (!collection.includes(key)) collection.push(key);
  return collection.indexOf(key);
}
function escapeValue(v) {
  return v.toLowerCase().replace(/\s/, "-");
}
function useCopyButton(onCopy) {
  const [checked, setChecked] = reactExports.useState(false);
  const callbackRef = reactExports.useRef(onCopy);
  const timeoutRef = reactExports.useRef(null);
  callbackRef.current = onCopy;
  const onClick = reactExports.useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    Promise.resolve(callbackRef.current()).then(() => {
      setChecked(true);
      timeoutRef.current = window.setTimeout(() => {
        setChecked(false);
      }, 1500);
    });
  }, []);
  reactExports.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);
  return [checked, onClick];
}
const TabsContext = reactExports.createContext(null);
function Pre(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("pre", {
    ...props,
    className: twMerge("min-w-full w-max *:flex *:flex-col", props.className),
    children: props.children
  });
}
function CodeBlock({ ref, title, allowCopy = true, keepBackground = false, icon, viewportProps = {}, children, Actions = (props$1) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
  ...props$1,
  className: twMerge("empty:hidden", props$1.className)
}), ...props }) {
  const inTab = reactExports.use(TabsContext) !== null;
  const areaRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("figure", {
    ref,
    dir: "ltr",
    ...props,
    tabIndex: -1,
    className: twMerge(inTab ? "bg-fd-secondary -mx-px -mb-px last:rounded-b-xl" : "my-4 bg-fd-card rounded-xl", keepBackground && "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)", "shiki relative border shadow-sm not-prose overflow-hidden text-sm", props.className),
    children: [title ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4",
      children: [
        typeof icon === "string" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "[&_svg]:size-3.5",
          dangerouslySetInnerHTML: { __html: icon }
        }) : icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("figcaption", {
          className: "flex-1 truncate",
          children: title
        }),
        Actions({
          className: "-me-2",
          children: allowCopy && /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton$1, { containerRef: areaRef })
        })
      ]
    }) : Actions({
      className: "absolute top-3 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground",
      children: allowCopy && /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton$1, { containerRef: areaRef })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      ref: areaRef,
      ...viewportProps,
      role: "region",
      tabIndex: 0,
      className: twMerge("text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring", viewportProps.className),
      style: {
        "--padding-right": !title ? "calc(var(--spacing) * 8)" : void 0,
        counterSet: props["data-line-numbers"] ? `line ${Number(props["data-line-numbers-start"] ?? 1) - 1}` : void 0,
        ...viewportProps.style
      },
      children
    })]
  });
}
function CopyButton$1({ className, containerRef, ...props }) {
  const [checked, onClick] = useCopyButton(() => {
    const pre = containerRef.current?.getElementsByTagName("pre").item(0);
    if (!pre) return;
    const clone = pre.cloneNode(true);
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.replaceWith("\n");
    });
    navigator.clipboard.writeText(clone.textContent ?? "");
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    type: "button",
    "data-checked": checked || void 0,
    className: twMerge(buttonVariants({
      className: "hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground",
      size: "icon-xs"
    }), className),
    "aria-label": checked ? "Copied Text" : "Copy Text",
    onClick,
    ...props,
    children: checked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Clipboard, {})
  });
}
function CodeBlockTabs({ ref, ...props }) {
  const containerRef = reactExports.useRef(null);
  const nested = reactExports.use(TabsContext) !== null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs$1, {
    ref: mergeRefs$1(containerRef, ref),
    ...props,
    className: twMerge("bg-fd-card rounded-xl border", !nested && "my-4", props.className),
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContext, {
      value: reactExports.useMemo(() => ({
        containerRef,
        nested
      }), [nested]),
      children: props.children
    })
  });
}
function CodeBlockTabsList(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList$1, {
    ...props,
    className: twMerge("flex flex-row px-2 overflow-x-auto text-fd-muted-foreground", props.className),
    children: props.children
  });
}
function CodeBlockTabsTrigger({ children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger$1, {
    ...props,
    className: twMerge("relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 hover:text-fd-accent-foreground data-[state=active]:text-fd-primary [&_svg]:size-3.5", props.className),
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary" }), children]
  });
}
function CodeBlockTab(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent$1, { ...props });
}
const defaultThemes = {
  light: "github-light",
  dark: "github-dark"
};
const highlighters = /* @__PURE__ */ new Map();
async function highlightHast(code, options) {
  const { lang: initialLang, fallbackLanguage, components: _, engine = "js", ...rest } = options;
  let lang = initialLang;
  let themes;
  let themesToLoad;
  if ("theme" in options && options.theme) {
    themes = { theme: options.theme };
    themesToLoad = [themes.theme];
  } else {
    themes = { themes: "themes" in options && options.themes ? options.themes : defaultThemes };
    themesToLoad = Object.values(themes.themes).filter((v) => v !== void 0);
  }
  const highlighter = await getHighlighter(engine, {
    langs: [],
    themes: themesToLoad
  });
  try {
    await highlighter.loadLanguage(lang);
  } catch {
    lang = fallbackLanguage ?? "text";
    await highlighter.loadLanguage(lang);
  }
  return highlighter.codeToHast(code, {
    lang,
    ...rest,
    ...themes,
    defaultColor: "themes" in themes ? false : void 0
  });
}
function hastToJsx(hast, options) {
  return toJsxRuntime(hast, {
    jsx: jsxRuntimeExports.jsx,
    jsxs: jsxRuntimeExports.jsxs,
    development: false,
    Fragment: reactExports.Fragment,
    ...options
  });
}
async function getHighlighter(engineType, options) {
  const { createHighlighter } = await import("../_libs/shiki.mjs").then(function(n) {
    return n.i;
  });
  let highlighter = highlighters.get(engineType);
  if (!highlighter) {
    let engine;
    if (engineType === "js") engine = import("../_libs/shiki.mjs").then(function(n) {
      return n.e;
    }).then((res) => res.createJavaScriptRegexEngine());
    else engine = import("../_libs/shiki.mjs").then(function(n) {
      return n.a;
    }).then((res) => res.createOnigurumaEngine(import("../_libs/shiki.mjs").then(function(n) {
      return n.w;
    })));
    highlighter = createHighlighter({
      ...options,
      engine
    });
    highlighters.set(engineType, highlighter);
    return highlighter;
  }
  return highlighter.then(async (instance) => {
    await Promise.all([instance.loadLanguage(...options.langs), instance.loadTheme(...options.themes)]);
    return instance;
  });
}
async function highlight(code, options) {
  return hastToJsx(await highlightHast(code, options), { components: options.components });
}
const promises = {};
function useShiki(code, options, deps) {
  const key = reactExports.useMemo(() => {
    return deps ? JSON.stringify(deps) : `${options.lang}:${code}`;
  }, [
    code,
    deps,
    options.lang
  ]);
  return reactExports.use(promises[key] ??= highlight(code, options));
}
const PropsContext = reactExports.createContext(void 0);
function DefaultPre(props) {
  const extraProps = reactExports.use(PropsContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CodeBlock, {
    ...props,
    ...extraProps,
    className: twMerge("my-0", props.className, extraProps?.className),
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pre, { children: props.children })
  });
}
function DynamicCodeBlock({ lang, code, codeblock, options, wrapInSuspense = true }) {
  const id = reactExports.useId();
  const shikiOptions = {
    lang,
    ...options,
    components: {
      pre: DefaultPre,
      ...options?.components
    }
  };
  const children = /* @__PURE__ */ jsxRuntimeExports.jsx(PropsContext, {
    value: codeblock,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Internal, {
      id,
      ...reactExports.useDeferredValue({
        code,
        options: shikiOptions
      })
    })
  });
  if (wrapInSuspense) return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
    fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Placeholder, {
      code,
      components: shikiOptions.components
    }),
    children
  });
  return children;
}
function Placeholder({ code, components = {} }) {
  const { pre: Pre$1 = "pre", code: Code = "code" } = components;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Pre$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { children: code.split("\n").map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
    className: "line",
    children: line
  }, i)) }) });
}
function Internal({ id, code, options }) {
  return useShiki(code, options, [
    id,
    options.lang,
    code
  ]);
}
function defineConfig(config2) {
  return {
    docs: { dir: "content/docs" },
    theme: { darkMode: true },
    ...config2
  };
}
const iconClass$1 = "h-5 w-5 text-fd-primary";
const config = defineConfig({
  title: "Termbridge",
  description: "Beam your local terminal to any device with tmux + Cloudflare tunnels.",
  logo: {
    light: "/logo-light.svg",
    dark: "/logo-dark.svg"
  },
  icon: "/icon.png",
  nav: {
    github: "inline0/termbridge"
  },
  homepage: {
    hero: {
      title: "Beam your terminal anywhere",
      description: "Termbridge runs a local server, tunnels it through Cloudflare, and streams your tmux session to any browser.",
      cta: { label: "Get Started", href: "/docs/getting-started" }
    },
    features: [
      {
        title: "Mobile Ready",
        description: "Scan the QR code and open your terminal on your phone in seconds.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: iconClass$1 })
      },
      {
        title: "True Terminal",
        description: "tmux + node-pty feed a real PTY into xterm.js with colors and TUIs.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: iconClass$1 })
      },
      {
        title: "Cloudflare Tunnel",
        description: "Quick Tunnel exposes your local server with no port-forwarding.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { className: iconClass$1 })
      },
      {
        title: "Secure by Default",
        description: "One-time tokens redeem into secure sessions for the tunnel URL.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: iconClass$1 })
      },
      {
        title: "Multi-Session",
        description: "One server can host multiple tmux sessions with in-app switching.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: iconClass$1 })
      },
      {
        title: "Fast Start",
        description: "Run `npx termbridge` and be online in under a minute.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: iconClass$1 })
      },
      {
        title: "CLI First",
        description: "Designed as a terminal-first tool with TTY status and QR output.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Command, { className: iconClass$1 })
      },
      {
        title: "QR Flow",
        description: "Share a secure, scannable URL for fast device handoff.",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: iconClass$1 })
      }
    ]
  }
});
const Route$7 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: config.title }
    ],
    links: config.icon ? [{ rel: "icon", href: config.icon }] : []
  }),
  shellComponent: RootDocument,
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RootLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `:root{--color-fd-border:hsla(0,0%,80%,50%);--color-fd-primary:hsl(0,0%,9%)}.dark{--color-fd-border:hsla(0,0%,40%,20%);--color-fd-primary:hsl(0,0%,98%)}@media(prefers-color-scheme:dark){:root:not(.light){--color-fd-border:hsla(0,0%,40%,20%);--color-fd-primary:hsl(0,0%,98%)}}@layer base{*,::before,::after{border-color:var(--color-fd-border)}}`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
const normalizeBaseUrl = (baseUrl2) => baseUrl2.replace(/\/+$/, "");
const normalizeDocsPath = (docsPath) => {
  const trimmed = docsPath.replace(/\/+$/, "");
  if (!trimmed || trimmed === "/")
    return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};
function createRobotsHandler({ baseUrl: baseUrl2, sitemapPath = "/sitemap.xml" }) {
  const siteUrl = normalizeBaseUrl(baseUrl2);
  const sitemapUrl = sitemapPath.startsWith("/") ? `${siteUrl}${sitemapPath}` : `${siteUrl}/${sitemapPath}`;
  const body = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
Host: ${siteUrl}
`;
  return () => new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
function createDocsSitemapHandler({ baseUrl: baseUrl2, pages: pages2, docsPath = "/docs" }) {
  const siteUrl = normalizeBaseUrl(baseUrl2);
  const docsBase = normalizeDocsPath(docsPath);
  const urls = [siteUrl];
  for (const page of pages2) {
    if (page.startsWith("---"))
      continue;
    if (page.startsWith("index")) {
      urls.push(`${siteUrl}${docsBase}/`);
      continue;
    }
    urls.push(`${siteUrl}${docsBase}/${page}/`);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const entries = urls.map((url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </url>`).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
  return () => new Response(sitemap, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}
const pages = ["index", "getting-started", "cli", "usage", "architecture", "development", "troubleshooting", "faq"];
const meta = {
  pages
};
const baseUrl$1 = "https://termbridge.dev";
const Route$6 = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: createDocsSitemapHandler({
        baseUrl: baseUrl$1,
        pages: meta.pages ?? []
      })
    }
  }
});
const baseUrl = "https://termbridge.dev";
const Route$5 = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: createRobotsHandler({ baseUrl })
    }
  }
});
function toLLMPageData(data, fallbackTitle) {
  const getText = data.getText;
  const load = data.load ? async () => {
    const loaded = await data.load?.();
    const structuredData = typeof loaded === "object" && loaded !== null ? loaded.structuredData : void 0;
    return structuredData ? { structuredData } : {};
  } : void 0;
  return {
    title: data.title ?? fallbackTitle,
    description: data.description,
    getText: getText ? (type) => getText(type) : void 0,
    load
  };
}
function createLLMsSource(source2) {
  return {
    getPages: () => source2.getPages().map((page) => ({
      url: page.url,
      data: toLLMPageData(page.data, page.slugs[page.slugs.length - 1] ?? page.url)
    }))
  };
}
async function getLLMText(page) {
  let text = "";
  if (page.data.getText) {
    try {
      text = await page.data.getText("processed");
    } catch {
    }
  }
  if (!text && page.data.load) {
    try {
      const content = await page.data.load();
      text = content?.structuredData?.content || "";
    } catch {
    }
  }
  return `# ${page.data.title}
URL: ${page.url}
${page.data.description ? `
${page.data.description}
` : ""}
${text}`;
}
function sortPages(pages2) {
  return [...pages2].sort((a, b) => {
    const aDepth = a.url.split("/").length;
    const bDepth = b.url.split("/").length;
    if (aDepth !== bDepth)
      return aDepth - bDepth;
    return a.url.localeCompare(b.url);
  });
}
function createLLMsHandler(source2, config2) {
  return {
    GET: async () => {
      const pages2 = sortPages(source2.getPages());
      const lines = [
        `# ${config2.title}`,
        "",
        config2.description ? `${config2.description}
` : "",
        "## Pages",
        ""
      ];
      for (const page of pages2) {
        lines.push(`- ${page.data.title}: ${page.url}`);
        if (page.data.description) {
          lines.push(`  ${page.data.description}`);
        }
      }
      lines.push("");
      lines.push("## Full Content");
      lines.push("");
      lines.push("For full documentation content, see /llms-full.txt");
      return new Response(lines.join("\n"), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }
  };
}
function createLLMsFullHandler(source2) {
  return {
    GET: async () => {
      const pages2 = sortPages(source2.getPages());
      const contents = await Promise.all(pages2.map(getLLMText));
      return new Response(contents.join("\n\n---\n\n"), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }
  };
}
const Route$4 = createFileRoute("/llms.txt")({
  server: {
    handlers: createLLMsHandler(createLLMsSource(source), {
      title: config.title,
      description: config.description
    })
  }
});
const Route$3 = createFileRoute("/llms-full.txt")({
  server: {
    handlers: createLLMsFullHandler(createLLMsSource(source))
  }
});
const $$splitComponentImporter$1 = () => import("./index-BlPcv5nE.mjs");
const Route$2 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
function browser() {
  return { doc(_name, glob) {
    return {
      raw: glob,
      createClientLoader({ id = _name, ...options }) {
        return createClientLoader(this.raw, {
          id,
          ...options
        });
      }
    };
  } };
}
const loaderStore = /* @__PURE__ */ new Map();
function createClientLoader(globEntries, options) {
  const { id = "", component: useRenderer } = options;
  const renderers = {};
  const loaders = /* @__PURE__ */ new Map();
  const store = loaderStore.get(id) ?? { preloaded: /* @__PURE__ */ new Map() };
  loaderStore.set(id, store);
  for (const k in globEntries) loaders.set(k.startsWith("./") ? k.slice(2) : k, globEntries[k]);
  function getLoader(path) {
    const loader = loaders.get(path);
    if (!loader) throw new Error(`[createClientLoader] ${path} does not exist in available entries`);
    return loader;
  }
  function getRenderer(path) {
    if (path in renderers) return renderers[path];
    let promise;
    function Renderer(props) {
      let doc = store.preloaded.get(path);
      doc ??= reactExports.use(promise ??= getLoader(path)());
      return useRenderer(doc, props);
    }
    return renderers[path] = Renderer;
  }
  return {
    async preload(path) {
      const loaded = await getLoader(path)();
      store.preloaded.set(path, loaded);
      return loaded;
    },
    getComponent(path) {
      return getRenderer(path);
    },
    useContent(path, props) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(getRenderer(path), { ...props });
    }
  };
}
const create = browser();
const browserCollections = {
  docs: create.doc("docs", /* @__PURE__ */ Object.assign({
    "./architecture.mdx": () => import("./architecture-B6rIRMbo.mjs"),
    "./cli.mdx": () => import("./cli-Bx-N1vu-.mjs"),
    "./development.mdx": () => import("./development-CTw5P7Rm.mjs"),
    "./faq.mdx": () => import("./faq-muUeh1hB.mjs"),
    "./getting-started.mdx": () => import("./getting-started-C4B4pcCK.mjs"),
    "./index.mdx": () => import("./index-r406VKGo.mjs"),
    "./troubleshooting.mdx": () => import("./troubleshooting-_zjMsQIP.mjs"),
    "./usage.mdx": () => import("./usage-Cr0zqD80.mjs")
  }))
};
function Cards(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    className: twMerge("grid grid-cols-2 gap-3 @container", props.className),
    children: props.children
  });
}
function Card({ icon, title, description, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(props.href ? Link : "div", {
    ...props,
    "data-card": true,
    className: twMerge("block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full", props.href && "hover:bg-fd-accent/80", props.className),
    children: [
      icon ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "not-prose mb-2 w-fit shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-4",
        children: icon
      }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
        className: "not-prose mb-1 text-sm font-medium",
        children: title
      }),
      description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "my-0! text-sm text-fd-muted-foreground",
        children: description
      }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "text-sm text-fd-muted-foreground prose-no-margin empty:hidden",
        children: props.children
      })
    ]
  });
}
const iconClass = "size-5 -me-0.5 fill-(--callout-color) text-fd-card";
function Callout({ children, title, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CalloutContainer, {
    ...props,
    children: [title && /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutTitle, { children: title }), /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutDescription, { children })]
  });
}
function resolveAlias(type) {
  if (type === "warn") return "warning";
  if (type === "tip") return "info";
  return type;
}
function CalloutContainer({ type: inputType = "info", icon, children, className, style, ...props }) {
  const type = resolveAlias(inputType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: twMerge("flex gap-2 my-4 rounded-xl border bg-fd-card p-3 ps-1 text-sm text-fd-card-foreground shadow-md", className),
    style: {
      "--callout-color": `var(--color-fd-${type}, var(--color-fd-muted))`,
      ...style
    },
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        role: "none",
        className: "w-0.5 bg-(--callout-color)/50 rounded-sm"
      }),
      icon ?? {
        info: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: iconClass }),
        warning: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: iconClass }),
        error: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: iconClass }),
        success: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: iconClass }),
        idea: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "size-5 -me-0.5 fill-(--callout-color) text-(--callout-color)" })
      }[type],
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "flex flex-col gap-2 min-w-0 flex-1",
        children
      })
    ]
  });
}
function CalloutTitle({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
    className: twMerge("font-medium my-0!", className),
    ...props,
    children
  });
}
function CalloutDescription({ children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: twMerge("text-fd-muted-foreground prose-no-margin empty:hidden", className),
    ...props,
    children
  });
}
function Heading({ as, className, ...props }) {
  const As = as ?? "h1";
  if (!props.id) return /* @__PURE__ */ jsxRuntimeExports.jsx(As, {
    className,
    ...props
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(As, {
    className: twMerge("flex scroll-m-28 flex-row items-center gap-2", className),
    ...props,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("a", {
      "data-card": "",
      href: `#${props.id}`,
      className: "peer",
      children: props.children
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Link$2, {
      "aria-hidden": true,
      className: "size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100"
    })]
  });
}
function Image$1(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Image, {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px",
    ...props,
    src: props.src,
    className: twMerge("rounded-lg", props.className)
  });
}
function Table(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "relative overflow-auto prose-no-margin my-6",
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { ...props })
  });
}
const defaultMdxComponents = {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  pre: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(CodeBlock, {
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pre, { children: props.children })
  }),
  Card,
  Cards,
  a: Link,
  img: Image$1,
  h1: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, {
    as: "h1",
    ...props
  }),
  h2: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, {
    as: "h2",
    ...props
  }),
  h3: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, {
    as: "h3",
    ...props
  }),
  h4: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, {
    as: "h4",
    ...props
  }),
  h5: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, {
    as: "h5",
    ...props
  }),
  h6: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, {
    as: "h6",
    ...props
  }),
  table: Table,
  Callout,
  CalloutContainer,
  CalloutTitle,
  CalloutDescription
};
function Steps({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "fd-steps",
    children
  });
}
function Step({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: "fd-step",
    children
  });
}
function Accordion$1({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, {
    className: twMerge("divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card", className),
    ...props
  });
}
function AccordionItem({ className, children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Item, {
    className: twMerge("scroll-m-24", className),
    ...props,
    children
  });
}
function AccordionHeader({ className, children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Header$1, {
    className: twMerge("not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent", className),
    ...props,
    children
  });
}
function AccordionTrigger({ className, children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Trigger2, {
    className: twMerge("group flex flex-1 items-center gap-2 px-3 py-2.5 text-start focus-visible:outline-none", className),
    ...props,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" }), children]
  });
}
function AccordionContent({ className, children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Content2$1, {
    className: twMerge("overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down", className),
    ...props,
    children
  });
}
function Accordions({ type = "single", ref, className, defaultValue, ...props }) {
  const rootRef = reactExports.useRef(null);
  const composedRef = mergeRefs$1(ref, rootRef);
  const [value, setValue] = reactExports.useState(() => type === "single" ? defaultValue ?? "" : defaultValue ?? []);
  reactExports.useEffect(() => {
    const id = window.location.hash.substring(1);
    const element = rootRef.current;
    if (!element || id.length === 0) return;
    const selected = document.getElementById(id);
    if (!selected || !element.contains(selected)) return;
    const value$1 = selected.getAttribute("data-accordion-value");
    if (value$1) setValue((prev) => typeof prev === "string" ? value$1 : [value$1, ...prev]);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion$1, {
    type,
    ref: composedRef,
    value,
    onValueChange: setValue,
    collapsible: type === "single" ? true : void 0,
    className: twMerge("divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card", className),
    ...props
  });
}
function Accordion({ title, id, value = String(title), children, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, {
    value,
    ...props,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionHeader, {
      id,
      "data-accordion-value": value,
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { children: title }), id ? /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { id }) : null]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "px-4 pb-2 text-[0.9375rem] prose-no-margin",
      children
    }) })]
  });
}
function CopyButton({ id }) {
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id;
    return navigator.clipboard.writeText(url.toString());
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    type: "button",
    "aria-label": "Copy Link",
    className: twMerge(buttonVariants({
      color: "ghost",
      className: "text-fd-muted-foreground me-2"
    })),
    onClick,
    children: checked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link$2, { className: "size-3.5" })
  });
}
const itemVariants = cva("flex flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4");
function Files({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: twMerge("not-prose rounded-md border bg-fd-card p-2", className),
    ...props,
    children: props.children
  });
}
function File({ name, icon = /* @__PURE__ */ jsxRuntimeExports.jsx(File$1, {}), className, ...rest }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: twMerge(itemVariants({ className })),
    ...rest,
    children: [icon, name]
  });
}
function Folder({ name, defaultOpen = false, ...props }) {
  const [open, setOpen] = reactExports.useState(defaultOpen);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible, {
    open,
    onOpenChange: setOpen,
    ...props,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsibleTrigger, {
      className: twMerge(itemVariants({ className: "w-full" })),
      children: [open ? /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Folder$1, {}), name]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "ms-2 flex flex-col border-l ps-2",
      children: props.children
    }) })]
  });
}
const $$splitComponentImporter = () => import("./_-CXJ8IeCE.mjs");
const Route$1 = createFileRoute("/docs/$")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  loader: async ({
    params
  }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({
      data: slugs
    });
    await clientLoader.preload(data.path);
    return data;
  }
});
const serverLoader = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(createSsrRpc("3754d170b07e5384cb393a7ce01e3317e54e102cb5b75ed0780e1a678ae2d91a"));
const mdxComponents = {
  ...defaultMdxComponents,
  Tab,
  Tabs,
  Callout,
  Card,
  Cards,
  Step,
  Steps,
  Accordion,
  Accordions,
  File,
  Folder,
  Files
};
const clientLoader = browserCollections.docs.createClientLoader({
  component({
    toc,
    frontmatter,
    default: MDX
  }) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(DocsPage, { toc, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocsTitle, { children: frontmatter.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocsDescription, { children: frontmatter.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocsBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MDX, { components: mdxComponents }) })
    ] });
  }
});
function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildRegexFromQuery(q) {
  const trimmed = q.trim();
  if (trimmed.length === 0) return null;
  const terms = Array.from(new Set(trimmed.split(/\s+/).map((t) => t.trim()).filter(Boolean)));
  if (terms.length === 0) return null;
  const escaped = terms.map(escapeRegExp).join("|");
  return new RegExp(`(${escaped})`, "gi");
}
function createContentHighlighter(query) {
  const regex = typeof query === "string" ? buildRegexFromQuery(query) : query;
  return { highlight(content) {
    if (!regex) return [{
      type: "text",
      content
    }];
    const out = [];
    let i = 0;
    for (const match of content.matchAll(regex)) {
      if (i < match.index) out.push({
        type: "text",
        content: content.substring(i, match.index)
      });
      out.push({
        type: "text",
        content: match[0],
        styles: { highlight: true }
      });
      i = match.index + match[0].length;
    }
    if (i < content.length) out.push({
      type: "text",
      content: content.substring(i)
    });
    return out;
  } };
}
function removeUndefined(value, deep = false) {
  const obj = value;
  for (const key in obj) {
    if (obj[key] === void 0) delete obj[key];
    if (!deep) continue;
    const entry = obj[key];
    if (typeof entry === "object" && entry !== null) {
      removeUndefined(entry, deep);
      continue;
    }
    if (Array.isArray(entry)) for (const item of entry) removeUndefined(item, deep);
  }
  return value;
}
async function searchSimple(db, query, params = {}) {
  const highlighter = createContentHighlighter(query);
  return (await search(db, {
    term: query,
    tolerance: 1,
    ...params,
    boost: {
      title: 2,
      ..."boost" in params ? params.boost : void 0
    }
  })).hits.map((hit) => ({
    type: "page",
    content: hit.document.title,
    breadcrumbs: hit.document.breadcrumbs,
    contentWithHighlights: highlighter.highlight(hit.document.title),
    id: hit.document.url,
    url: hit.document.url
  }));
}
async function searchAdvanced(db, query, tag = [], { mode = "fulltext", ...override } = {}) {
  if (typeof tag === "string") tag = [tag];
  let params = {
    ...override,
    mode,
    where: removeUndefined({
      tags: tag.length > 0 ? { containsAll: tag } : void 0,
      ...override.where
    }),
    groupBy: {
      properties: ["page_id"],
      maxResult: 8,
      ...override.groupBy
    }
  };
  if (query.length > 0) params = {
    ...params,
    term: query,
    properties: mode === "fulltext" ? ["content"] : ["content", "embeddings"]
  };
  const highlighter = createContentHighlighter(query);
  const result = await search(db, params);
  const list = [];
  for (const item of result.groups ?? []) {
    const pageId = item.values[0];
    const page = getByID(db, pageId);
    if (!page) continue;
    list.push({
      id: pageId,
      type: "page",
      content: page.content,
      breadcrumbs: page.breadcrumbs,
      contentWithHighlights: highlighter.highlight(page.content),
      url: page.url
    });
    for (const hit of item.result) {
      if (hit.document.type === "page") continue;
      list.push({
        id: hit.document.id.toString(),
        content: hit.document.content,
        breadcrumbs: hit.document.breadcrumbs,
        contentWithHighlights: highlighter.highlight(hit.document.content),
        type: hit.document.type,
        url: hit.document.url
      });
    }
  }
  return list;
}
function createEndpoint(server2) {
  const { search: search$1 } = server2;
  return {
    ...server2,
    async staticGET() {
      return Response.json(await server2.export());
    },
    async GET(request) {
      const url = new URL(request.url);
      const query = url.searchParams.get("query");
      if (!query) return Response.json([]);
      return Response.json(await search$1(query, {
        tag: url.searchParams.get("tag")?.split(",") ?? void 0,
        locale: url.searchParams.get("locale") ?? void 0,
        mode: url.searchParams.get("mode") === "vector" ? "vector" : "full"
      }));
    }
  };
}
const advancedSchema = {
  content: "string",
  page_id: "string",
  type: "string",
  breadcrumbs: "string[]",
  tags: "enum[]",
  url: "string",
  embeddings: "vector[512]"
};
async function createDB({ indexes, tokenizer, search: _, ...rest }) {
  const items = typeof indexes === "function" ? await indexes() : indexes;
  const db = create$1({
    schema: advancedSchema,
    ...rest,
    components: {
      ...rest.components,
      tokenizer: tokenizer ?? rest.components?.tokenizer
    }
  });
  const mapTo = [];
  items.forEach((page) => {
    const pageTag = page.tag ?? [];
    const tags = Array.isArray(pageTag) ? pageTag : [pageTag];
    const data = page.structuredData;
    let id = 0;
    mapTo.push({
      id: page.id,
      page_id: page.id,
      type: "page",
      content: page.title,
      breadcrumbs: page.breadcrumbs,
      tags,
      url: page.url
    });
    const nextId = () => `${page.id}-${id++}`;
    if (page.description) mapTo.push({
      id: nextId(),
      page_id: page.id,
      tags,
      type: "text",
      url: page.url,
      content: page.description
    });
    for (const heading of data.headings) mapTo.push({
      id: nextId(),
      page_id: page.id,
      type: "heading",
      tags,
      url: `${page.url}#${heading.id}`,
      content: heading.content
    });
    for (const content of data.contents) mapTo.push({
      id: nextId(),
      page_id: page.id,
      tags,
      type: "text",
      url: content.heading ? `${page.url}#${content.heading}` : page.url,
      content: content.content
    });
  });
  await insertMultiple(db, mapTo);
  return db;
}
function defaultBuildIndex(source2) {
  function isBreadcrumbItem(item) {
    return typeof item === "string" && item.length > 0;
  }
  return async (page) => {
    let breadcrumbs;
    let structuredData;
    if ("structuredData" in page.data) structuredData = page.data.structuredData;
    else if ("load" in page.data && typeof page.data.load === "function") structuredData = (await page.data.load()).structuredData;
    if (!structuredData) throw new Error("Cannot find structured data from page, please define the page to index function.");
    const pageTree = source2.getPageTree(page.locale);
    const path = findPath(pageTree.children, (node) => node.type === "page" && node.url === page.url);
    if (path) {
      breadcrumbs = [];
      path.pop();
      if (isBreadcrumbItem(pageTree.name)) breadcrumbs.push(pageTree.name);
      for (const segment of path) {
        if (!isBreadcrumbItem(segment.name)) continue;
        breadcrumbs.push(segment.name);
      }
    }
    return {
      title: page.data.title ?? basename(page.path, extname(page.path)),
      breadcrumbs,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData
    };
  };
}
function createFromSource(source2, options = {}) {
  const { buildIndex = defaultBuildIndex(source2) } = options;
  if (source2._i18n) return createI18nSearchAPI("advanced", {
    ...options,
    i18n: source2._i18n,
    indexes: async () => {
      const indexes = source2.getLanguages().flatMap((entry) => {
        return entry.pages.map(async (page) => ({
          ...await buildIndex(page),
          locale: entry.language
        }));
      });
      return Promise.all(indexes);
    }
  });
  return createSearchAPI("advanced", {
    ...options,
    indexes: async () => {
      const indexes = source2.getPages().map((page) => buildIndex(page));
      return Promise.all(indexes);
    }
  });
}
const STEMMERS = {
  arabic: "ar",
  armenian: "am",
  bulgarian: "bg",
  czech: "cz",
  danish: "dk",
  dutch: "nl",
  english: "en",
  finnish: "fi",
  french: "fr",
  german: "de",
  greek: "gr",
  hungarian: "hu",
  indian: "in",
  indonesian: "id",
  irish: "ie",
  italian: "it",
  lithuanian: "lt",
  nepali: "np",
  norwegian: "no",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  serbian: "rs",
  slovenian: "ru",
  spanish: "es",
  swedish: "se",
  tamil: "ta",
  turkish: "tr",
  ukrainian: "uk",
  sanskrit: "sk"
};
async function getTokenizer(locale) {
  return { language: Object.keys(STEMMERS).find((lang) => STEMMERS[lang] === locale) ?? locale };
}
async function initAdvanced(options) {
  const map = /* @__PURE__ */ new Map();
  if (options.i18n.languages.length === 0) return map;
  const indexes = typeof options.indexes === "function" ? await options.indexes() : options.indexes;
  for (const locale of options.i18n.languages) {
    const localeIndexes = indexes.filter((index) => index.locale === locale);
    const mapped = options.localeMap?.[locale] ?? await getTokenizer(locale);
    map.set(locale, typeof mapped === "object" ? initAdvancedSearch({
      ...options,
      indexes: localeIndexes,
      ...mapped
    }) : initAdvancedSearch({
      ...options,
      language: mapped,
      indexes: localeIndexes
    }));
  }
  return map;
}
function createI18nSearchAPI(type, options) {
  const get = initAdvanced(options);
  return createEndpoint({
    async export() {
      const map = await get;
      const entries = Array.from(map.entries()).map(async ([k, v]) => [k, await v.export()]);
      return {
        type: "i18n",
        data: Object.fromEntries(await Promise.all(entries))
      };
    },
    async search(query, searchOptions) {
      const map = await get;
      const locale = searchOptions?.locale ?? options.i18n.defaultLanguage;
      const handler = map.get(locale);
      if (handler) return handler.search(query, searchOptions);
      return [];
    }
  });
}
function createSearchAPI(type, options) {
  return createEndpoint(initAdvancedSearch(options));
}
function initAdvancedSearch(options) {
  const get = createDB(options);
  return {
    async export() {
      return {
        type: "advanced",
        ...save(await get)
      };
    },
    async search(query, searchOptions) {
      const db = await get;
      const mode = searchOptions?.mode;
      return searchAdvanced(db, query, searchOptions?.tag, {
        ...options.search,
        mode: mode === "vector" ? "vector" : "fulltext"
      }).catch((err) => {
        if (mode === "vector") throw new Error("failed to search, make sure you have installed `@orama/plugin-embeddings` according to their docs.", { cause: err });
        throw err;
      });
    }
  };
}
const server = createFromSource(source, {
  language: "english"
});
const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => server.GET(request)
    }
  }
});
const SitemapDotxmlRoute = Route$6.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$7
});
const RobotsDottxtRoute = Route$5.update({
  id: "/robots.txt",
  path: "/robots.txt",
  getParentRoute: () => Route$7
});
const LlmsDottxtRoute = Route$4.update({
  id: "/llms.txt",
  path: "/llms.txt",
  getParentRoute: () => Route$7
});
const LlmsFullDottxtRoute = Route$3.update({
  id: "/llms-full.txt",
  path: "/llms-full.txt",
  getParentRoute: () => Route$7
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const DocsSplatRoute = Route$1.update({
  id: "/docs/$",
  path: "/docs/$",
  getParentRoute: () => Route$7
});
const ApiSearchRoute = Route.update({
  id: "/api/search",
  path: "/api/search",
  getParentRoute: () => Route$7
});
const rootRouteChildren = {
  IndexRoute,
  LlmsFullDottxtRoute,
  LlmsDottxtRoute,
  RobotsDottxtRoute,
  SitemapDotxmlRoute,
  ApiSearchRoute,
  DocsSplatRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true
  });
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  DocsDescription as A,
  DocsBody as B,
  Folder as C,
  DynamicCodeBlock as D,
  File as E,
  Files as F,
  Accordions as G,
  Header as H,
  Accordion as I,
  Steps as J,
  Step as K,
  LayoutContextProvider as L,
  Cards as M,
  Card as N,
  Callout as O,
  defaultMdxComponents as P,
  useRouter as Q,
  Route$1 as R,
  SidebarProvider as S,
  Tabs as T,
  i18n_exports as U,
  useOnChange as V,
  createContentHighlighter as W,
  removeUndefined as X,
  searchSimple as Y,
  searchAdvanced as Z,
  router as _,
  Tab as a,
  LayoutBody as b,
  config as c,
  LayoutHeader as d,
  renderTitleNav as e,
  SearchToggle as f,
  SidebarTrigger as g,
  buttonVariants as h,
  LayoutTabs as i,
  SidebarViewport as j,
  SidebarLinkItem as k,
  SidebarPageTree as l,
  SidebarContent as m,
  SidebarCollapseTrigger as n,
  LargeSearchToggle as o,
  SidebarTabsDropdown as p,
  LanguageToggle as q,
  resolveLinkItems as r,
  LinkItem as s,
  tree_exports as t,
  ThemeToggle as u,
  SidebarDrawer as v,
  LanguageToggleText as w,
  browserCollections as x,
  DocsPage as y,
  DocsTitle as z
};
