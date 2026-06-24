import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface StatusTransitionConfirmModalProps {
  itemName: string;
  fromLabel: string;
  toLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirms a status change away from a finalized, hard-won outcome
 * (Accepted, Awarded) to something else. This only guards that specific
 * direction of change; moving between in-progress statuses never prompts,
 * since there's nothing to lose there. The person's own judgement is
 * always respected, this is a single extra click, not a block.
 */
export function StatusTransitionConfirmModal({
  itemName,
  fromLabel,
  toLabel,
  onConfirm,
  onCancel,
}: StatusTransitionConfirmModalProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <AlertTriangle
              className="size-6 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          </div>
          <AlertDialogTitle className="text-base">
            Change status from {fromLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center">
            <span className="font-medium text-foreground">{itemName}</span> is
            currently marked <strong>{fromLabel}</strong>. Changing it to{" "}
            <strong>{toLabel}</strong> will replace that outcome.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Change Status
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
