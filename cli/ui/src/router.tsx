import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { TerminalPage } from "./terminal-page";

const rootRoute = createRootRoute({
  component: () => <Outlet />
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TerminalPage
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
  basepath: "/app"
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
