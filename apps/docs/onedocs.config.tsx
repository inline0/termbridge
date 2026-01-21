import { defineConfig } from "onedocs/config";
import {
  Smartphone,
  Terminal,
  Cloud,
  ShieldCheck,
  LayoutGrid,
  Zap,
  Command,
  QrCode,
  AppWindow,
  RefreshCw,
  PanelTop,
  Workflow,
} from "lucide-react";

const iconClass = "h-5 w-5 text-fd-primary";

export default defineConfig({
  title: "Termbridge",
  description: "Beam your local terminal to any device with tmux + Cloudflare tunnels.",
  logo: {
    light: "/logo-light.svg",
    dark: "/logo-dark.svg",
  },
  icon: "/icon.png",
  nav: {
    github: "inline0/termbridge",
  },
  homepage: {
    hero: {
      title: "Beam your terminal anywhere",
      description:
        "Termbridge runs a local server, tunnels it through Cloudflare, and streams your tmux session to any browser.",
      cta: { label: "Get Started", href: "/docs/getting-started" },
    },
    features: [
      {
        title: "Mobile Ready",
        description: "Scan the QR code and open your terminal on your phone in seconds.",
        icon: <Smartphone className={iconClass} />,
      },
      {
        title: "True Terminal",
        description: "tmux + node-pty feed a real PTY into xterm.js with colors and TUIs.",
        icon: <Terminal className={iconClass} />,
      },
      {
        title: "Cloudflare Tunnel",
        description: "Quick Tunnel exposes your local server with no port-forwarding.",
        icon: <Cloud className={iconClass} />,
      },
      {
        title: "Secure by Default",
        description: "One-time tokens redeem into secure sessions for the tunnel URL.",
        icon: <ShieldCheck className={iconClass} />,
      },
      {
        title: "Multi-Session",
        description: "One server can host multiple tmux sessions with in-app switching.",
        icon: <LayoutGrid className={iconClass} />,
      },
      {
        title: "Fast Start",
        description: "Run `npx termbridge` and be online in under a minute.",
        icon: <Zap className={iconClass} />,
      },
      {
        title: "CLI First",
        description: "Designed as a terminal-first tool with TTY status and QR output.",
        icon: <Command className={iconClass} />,
      },
      {
        title: "QR Flow",
        description: "Share a secure, scannable URL for fast device handoff.",
        icon: <QrCode className={iconClass} />,
      },
      {
        title: "Dev Server Preview",
        description: "Proxy your local Vite app and preview it alongside the terminal.",
        icon: <AppWindow className={iconClass} />,
      },
      {
        title: "HMR Passthrough",
        description: "WebSocket proxying keeps Vite's Hot Module Replacement working.",
        icon: <RefreshCw className={iconClass} />,
      },
      {
        title: "Tab Switching",
        description: "Toggle between Terminal and Preview views with a single tap.",
        icon: <PanelTop className={iconClass} />,
      },
      {
        title: "Full-Stack Workflow",
        description: "Run terminal commands and watch your app update in real-time.",
        icon: <Workflow className={iconClass} />,
      },
    ],
  },
});
