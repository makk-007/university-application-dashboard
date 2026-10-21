import { useRouteError } from "react-router";

/**
 * Route-level error handler that rethrows to the app-level ErrorBoundary, so
 * route failures (a page that fails to load after a new deploy, or a render
 * error inside a page) show the same "Something went wrong / Reload page"
 * screen as any other error instead of React Router's default error page.
 */
export function RouteError(): never {
  throw useRouteError();
}
