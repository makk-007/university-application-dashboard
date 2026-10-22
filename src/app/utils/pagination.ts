/**
 * Page buttons to show in a pager: always the first and last page plus the
 * current page and its neighbours, with "…" standing in for any skipped run.
 * Example for page 5 of 10: [1, "…", 4, 5, 6, "…", 10].
 */
export function getPageItems(
  page: number,
  totalPages: number,
): (number | "…")[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);
}
