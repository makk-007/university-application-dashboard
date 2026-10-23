import { Copy, Trash2 } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  singular: string;
  plural: string;
  onClear: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** Extra spacing classes for the wrapper (e.g. "mb-4"). */
  className?: string;
}

/** "N selected" bar with Clear, Duplicate to Cycle and Delete Selected. */
export function BulkActionBar({
  count,
  singular,
  plural,
  onClear,
  onDuplicate,
  onDelete,
  className = "",
}: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 bg-secondary/50 border border-border rounded-lg px-4 py-3 ${className}`}
    >
      <span className="text-sm text-foreground">
        {count} {count === 1 ? singular : plural} selected
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="px-3 h-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onDuplicate}
          className="inline-flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Copy className="size-3.5" aria-hidden="true" />
          Duplicate to Cycle
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 h-8 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Delete Selected
        </button>
      </div>
    </div>
  );
}
