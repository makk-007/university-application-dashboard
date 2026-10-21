import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RouteFallback } from "./components/RouteFallback";
import { RouteError } from "./components/RouteError";

// Pages are loaded on demand so a first visit (often the sign-in screen) does
// not download every page plus the charting library up front. The router
// keeps the current page on screen until the next one has loaded, so page
// navigations show no extra loading state.
const routeDefaults = {
  HydrateFallback: RouteFallback,
  ErrorBoundary: RouteError,
};

export const router = createBrowserRouter([
  {
    path: "/login",
    ...routeDefaults,
    lazy: async () => {
      const { Auth } = await import("./pages/Auth");
      return { Component: () => <Auth defaultMode="login" /> };
    },
  },
  {
    path: "/signup",
    ...routeDefaults,
    lazy: async () => {
      const { Auth } = await import("./pages/Auth");
      return { Component: () => <Auth defaultMode="signup" /> };
    },
  },
  {
    path: "/",
    Component: Layout,
    ...routeDefaults,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("./pages/DashboardOverview")).DashboardOverview,
        }),
      },
      {
        path: "universities",
        lazy: async () => ({
          Component: (await import("./pages/Universities")).Universities,
        }),
      },
      {
        path: "scholarships",
        lazy: async () => ({
          Component: (await import("./pages/Scholarships")).Scholarships,
        }),
      },
      {
        path: "timeline",
        lazy: async () => ({
          Component: (await import("./pages/Timeline")).Timeline,
        }),
      },
      {
        path: "settings",
        lazy: async () => ({
          Component: (await import("./pages/Settings")).Settings,
        }),
      },
    ],
  },
]);
