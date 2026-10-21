/**
 * Shown while the first route of a visit is still being downloaded. It only
 * paints the themed background so there is no white flash in dark mode.
 * (Later navigations never show it: the router keeps the current page on
 * screen until the next page's code has loaded.)
 */
export function RouteFallback() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-busy="true">
      <span className="sr-only">Loading</span>
    </div>
  );
}
