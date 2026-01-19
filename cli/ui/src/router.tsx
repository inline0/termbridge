import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useParams
} from "@tanstack/react-router";
import { useCallback } from "react";
import { TerminalPage } from "./terminal-page";

const TerminalIndexRoute = () => {
  const navigate = useNavigate();
  const handleSelectTerminal = useCallback(
    (terminalId: string) => {
      navigate({ to: "/terminal/$terminalId", params: { terminalId } });
    },
    [navigate]
  );

  return <TerminalPage terminalId={null} onSelectTerminal={handleSelectTerminal} />;
};

const TerminalRoute = () => {
  const navigate = useNavigate();
  const { terminalId } = useParams({ from: "/terminal/$terminalId" });
  const handleSelectTerminal = useCallback(
    (nextTerminalId: string) => {
      navigate({ to: "/terminal/$terminalId", params: { terminalId: nextTerminalId } });
    },
    [navigate]
  );

  return <TerminalPage terminalId={terminalId} onSelectTerminal={handleSelectTerminal} />;
};

const rootRoute = createRootRoute({
  component: () => <Outlet />
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TerminalIndexRoute
});

const terminalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terminal/$terminalId",
  component: TerminalRoute
});

const routeTree = rootRoute.addChildren([indexRoute, terminalRoute]);

export const router = createRouter({
  routeTree,
  basepath: "/app"
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
