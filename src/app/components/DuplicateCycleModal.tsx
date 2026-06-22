import { useState } from "react";
import { motion } from "motion/react";
import { Copy, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { ApplicationCycle } from "../types";
import {
  duplicateCycleContents,
  DuplicateCycleResult,
} from "../../services/cycles";
import { selectCls } from "./ui/input-classes";

interface DuplicateCycleModalProps {
  sourceCycle: ApplicationCycle;
  cycles: ApplicationCycle[];
  onClose: () => void;
}

export function DuplicateCycleModal({
  sourceCycle,
  cycles,
  onClose,
}: DuplicateCycleModalProps) {
  const destinationOptions = cycles.filter((c) => c.id !== sourceCycle.id);
  const [targetCycleId, setTargetCycleId] = useState(
    destinationOptions[0]?.id ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DuplicateCycleResult | null>(null);

  const targetCycle = cycles.find((c) => c.id === targetCycleId);

  const handleConfirm = async () => {
    if (!targetCycleId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await duplicateCycleContents(sourceCycle.id, targetCycleId);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
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
            Duplicate Cycle Contents
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

        {result ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-foreground bg-secondary/50 border border-border rounded-lg px-3 py-3">
              <CheckCircle2
                className="size-5 text-green-600 dark:text-green-400 shrink-0"
                aria-hidden="true"
              />
              <span>
                Duplicated <strong>{result.universitiesDuplicated}</strong>{" "}
                {result.universitiesDuplicated === 1
                  ? "university"
                  : "universities"}{" "}
                and <strong>{result.scholarshipsDuplicated}</strong>{" "}
                {result.scholarshipsDuplicated === 1
                  ? "scholarship"
                  : "scholarships"}{" "}
                into {targetCycle?.name ?? "the destination cycle"}.
              </span>
            </div>
            {result.failures.length > 0 && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-3">
                <p className="font-medium mb-1.5">
                  {result.failures.length}{" "}
                  {result.failures.length === 1 ? "item" : "items"} could not be
                  duplicated:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.failures.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              All cycle-specific details, dates, amounts, and statuses can be
              edited freely in the new cycle.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Copy every university and scholarship from{" "}
              <span className="font-medium text-foreground">
                {sourceCycle.name}
              </span>{" "}
              into another cycle as independent records. Statuses reset to "Not
              Started" and cross-links (eligible universities, scholarship
              links) are not carried over, since they would reference records
              from the old cycle.
            </p>

            {destinationOptions.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No other cycles exist yet. Create another cycle before
                  duplicating {sourceCycle.name}'s contents.
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
                Duplicate Cycle
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
