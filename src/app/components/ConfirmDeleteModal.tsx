import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  /** Name of the item being deleted : shown in the message */
  itemName: string;
  /** "university" | "scholarship" : used to build the description */
  itemType: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  itemName,
  itemType,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-card rounded-xl border shadow-xl w-full max-w-sm">
        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center px-6 pt-7 pb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Delete {itemType}?
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="font-medium text-foreground">{itemName}</span> will
            be permanently removed. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
