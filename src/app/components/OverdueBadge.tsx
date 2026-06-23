import { AlertTriangle } from "lucide-react";

interface OverdueBadgeProps {
  size?: "sm" | "md";
}

/**
 * Purely visual indicator that an application's deadline has passed while
 * it is still Not Started or In Progress. This never changes the stored
 * status; it is computed at render time from isOverdue() so the user's own
 * status choice always remains authoritative.
 */
export function OverdueBadge({ size = "md" }: OverdueBadgeProps) {
  const sizeClass =
    size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap bg-destructive/10 text-destructive ${sizeClass}`}
    >
      <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
      Overdue
    </span>
  );
}
