import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarRange,
  Plus,
  X,
  AlertCircle,
  Pencil,
  Archive,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCycle } from "../context/CycleContext";
import { ApplicationCycle } from "../types";
import { inputCls, textareaCls } from "./ui/input-classes";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// ── Create / Edit Modal ────────────────────────────────────────────────────

function CycleFormModal({
  cycle,
  onClose,
}: {
  cycle: ApplicationCycle | null;
  onClose: () => void;
}) {
  const { cycles, createCycle, updateCycle } = useCycle();
  const isEditing = !!cycle;
  const hasNoCycles = cycles.length === 0;
  const [form, setForm] = useState({
    name: cycle?.name ?? "",
    description: cycle?.description ?? "",
    startDate: cycle?.startDate ?? "",
    endDate: cycle?.endDate ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((fe) => {
      const n = { ...fe };
      delete n[k];
      return n;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Cycle name is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.endDate = "End date must be after the start date";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await updateCycle(cycle.id, {
          name: form.name.trim(),
          description: form.description,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
        toast.success("Cycle updated", { description: form.name.trim() });
      } else {
        await createCycle({
          name: form.name.trim(),
          description: form.description,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          isActive: hasNoCycles,
        });
        toast.success("Cycle created", { description: form.name.trim() });
      }
      onClose();
    } catch (e: any) {
      setError(e.message);
      toast.error(
        isEditing ? "Failed to update cycle" : "Failed to create cycle",
        { description: e.message },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-card rounded-xl border shadow-xl w-full sm:max-w-md sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEditing ? "Edit Cycle" : "New Cycle"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Cycle Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`${inputCls} ${fieldErrors.name ? "border-destructive focus-visible:border-destructive" : ""}`}
              placeholder="e.g. Fall 2026"
              autoFocus
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.name}
              </p>
            )}
            {!isEditing && hasNoCycles && (
              <p className="text-xs text-muted-foreground mt-1.5">
                This will be set as your active cycle since you don't have one
                yet.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={`${inputCls} ${fieldErrors.endDate ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          {fieldErrors.endDate && (
            <p className="text-xs text-destructive -mt-2">
              {fieldErrors.endDate}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional notes about this cycle"
              className={textareaCls}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              {saving && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {isEditing ? "Save Changes" : "Create Cycle"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Archive Confirmation ────────────────────────────────────────────────────

function ArchiveCycleModal({
  cycle,
  saving,
  onConfirm,
  onCancel,
}: {
  cycle: ApplicationCycle;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <Archive className="size-6 text-amber-600" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-base">
            Archive {cycle.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center">
            This cycle will no longer be active and won't be selectable for new
            universities or scholarships. All existing applications in this
            cycle are kept and remain fully visible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row gap-3 mt-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 h-9 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 h-9 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {saving && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Archive
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main Card ────────────────────────────────────────────────────────────────

export function CycleManagementCard() {
  const { cycles, loading, error, setActiveCycle, archiveCycle } = useCycle();
  const [formCycle, setFormCycle] = useState<ApplicationCycle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [archiving, setArchiving] = useState<ApplicationCycle | null>(null);
  const [archiveSaving, setArchiveSaving] = useState(false);
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null);

  const openCreate = () => {
    setFormCycle(null);
    setShowForm(true);
  };

  const openEdit = (cycle: ApplicationCycle) => {
    setFormCycle(cycle);
    setShowForm(true);
  };

  const handleSetActive = async (cycle: ApplicationCycle) => {
    setSettingActiveId(cycle.id);
    try {
      await setActiveCycle(cycle.id);
      toast.success("Active cycle updated", { description: cycle.name });
    } catch (e: any) {
      toast.error("Failed to set active cycle", { description: e.message });
    } finally {
      setSettingActiveId(null);
    }
  };

  const handleArchive = async () => {
    if (!archiving) return;
    setArchiveSaving(true);
    try {
      await archiveCycle(archiving.id);
      toast.success("Cycle archived", { description: archiving.name });
      setArchiving(null);
    } catch (e: any) {
      toast.error("Failed to archive cycle", { description: e.message });
    } finally {
      setArchiveSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <CalendarRange
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-foreground">
            Application Cycles
          </h2>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New Cycle
        </button>
      </div>

      <div className="px-6 py-5 space-y-3">
        <p className="text-xs text-muted-foreground">
          Organize universities and scholarships into named cycles, like Fall
          2026 or 2027 Intake. New applications are added to the active cycle
          below.
        </p>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : cycles.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <CalendarRange
              className="size-8 text-muted-foreground/50 mx-auto mb-2"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              No cycles yet. Create your first cycle to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {cycle.name}
                    </p>
                    {cycle.isActive && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        Active
                      </span>
                    )}
                  </div>
                  {(cycle.startDate || cycle.endDate) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cycle.startDate ?? "No start"} to{" "}
                      {cycle.endDate ?? "No end"}
                    </p>
                  )}
                  {cycle.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {cycle.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!cycle.isActive && (
                    <button
                      onClick={() => handleSetActive(cycle)}
                      disabled={settingActiveId === cycle.id}
                      className="px-2.5 h-8 text-xs font-medium border border-border rounded-md text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
                    >
                      {settingActiveId === cycle.id
                        ? "Setting..."
                        : "Set Active"}
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(cycle)}
                    aria-label={`Edit ${cycle.name}`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  {!cycle.isActive && (
                    <button
                      onClick={() => setArchiving(cycle)}
                      aria-label={`Archive ${cycle.name}`}
                      className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-accent rounded-md transition-colors"
                    >
                      <Archive className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <CycleFormModal
            cycle={formCycle}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {archiving && (
        <ArchiveCycleModal
          cycle={archiving}
          saving={archiveSaving}
          onCancel={() => setArchiving(null)}
          onConfirm={handleArchive}
        />
      )}
    </div>
  );
}
