import { getPageItems } from "../utils/pagination";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Display and spacing classes for the wrapper (e.g. "flex mt-4"). */
  className?: string;
}

const NAV_BUTTON =
  "h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors";

/**
 * "Showing 1–10 of 42" summary plus first / previous / numbered / next / last
 * buttons. Renders nothing when everything fits on one page.
 */
export function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`items-center justify-between ${className}`}>
      <p className="text-xs text-muted-foreground tabular-nums">
        Showing {(page - 1) * pageSize + 1}–
        {Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
          className={NAV_BUTTON}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className={NAV_BUTTON}
        >
          ‹
        </button>
        {getPageItems(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="h-8 w-8 flex items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? "page" : undefined}
              className={`h-8 w-8 flex items-center justify-center rounded-md border text-sm transition-colors ${page === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          className={NAV_BUTTON}
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
          className={NAV_BUTTON}
        >
          »
        </button>
      </div>
    </div>
  );
}
