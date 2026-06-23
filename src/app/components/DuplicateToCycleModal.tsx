import { useState, ReactNode } from "react";
import { motion } from "motion/react";
import { Copy, X, AlertCircle, Loader2 } from "lucide-react";
import { ApplicationCycle } from "../types";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { selectCls } from "./ui/input-classes";

interface DuplicateToCycleModalProps {
  /** Description of what's being duplicated, e.g. an item name or "3 universities". */
  description: ReactNode;
  itemLabel: string;
  sourceCycleId: string | null;
  cycles: ApplicationCycle[];
  onClose: () => void;
  onConfirm: (targetCycleId: string | null) => Promise<void>;
}

export function DuplicateToCycleModal({
  description,
  itemLabel,
  sourceCycleId,
  cycles,
  onClose,
  onConfirm,
}: DuplicateToCycleModalProps) {
  const destinationOptions = cycles.filter((c) => c.id !== sourceCycleId);
  const defaultTarget =
    destinationOptions.find((c) => c.isActive)?.id ??
    destinationOptions[0]?.id ??
    "";
  const [targetCycleId, setTargetCycleId] = useState(defaultTarget);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEscapeKey(onClose, !saving);

  const handleConfirm = async () => {
    if (!targetCycleId) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm(targetCycleId);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-card rounded-xl border card-raised w-full sm:max-w-md sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Duplicate to Cycle
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Create an independent copy of{" "}
            <span className="font-medium text-foreground">{description}</span>{" "}
            in another cycle. Editing the copy will never affect the original.
          </p>

          {destinationOptions.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                No other cycles exist yet. Create another cycle in Settings
                before duplicating this {itemLabel}.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Destination Cycle
              </label>
              <select
                value={targetCycleId}
                onChange={(e) => setTargetCycleId(e.target.value)}
                className={selectCls}
                autoFocus
              >
                {destinationOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.isActive ? " (Active)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                The copy will start as "Not Started" so it can be tracked fresh
                in the new cycle, and any linked scholarships or universities
                will need to be re-linked there.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-9 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || !targetCycleId}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              Duplicate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
