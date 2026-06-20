import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertCircle,
  X,
  Check,
  Loader2,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { University, ApplicationStatus } from "../types";
import { useCycle } from "../context/CycleContext";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { StatusBadge } from "../components/StatusBadge";
import { Skeleton } from "../components/ui/skeleton";
import {
  statusConfig,
  statusStrong,
  ALL_STATUSES,
  UNI_STATUSES,
  getDaysUntil,
  getDeadlineUrgency,
} from "../utils/statusConfig";
import {
  inputCls,
  selectCls,
  textareaCls,
} from "../components/ui/input-classes";
import {
  getUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "../../services/universities";

const REGIONS = [
  "North America",
  "Europe",
  "Asia",
  "Oceania",
  "Africa",
  "South America",
  "Middle East",
];
const CURRENCIES = ["USD", "EUR", "GBP", "SEK", "GHS"];

function AddUniversityModal({
  activeCycleId,
  onClose,
  onSaved,
}: {
  activeCycleId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    region: "Europe",
    tuition: 0,
    currency: "USD",
    startDate: "",
    deadline: "",
    applicationLink: "",
    notes: "",
    status: "not-started" as ApplicationStatus,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((fe) => {
      const n = { ...fe };
      delete n[k];
      return n;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "University name is required";
    if (form.applicationLink && !/^https?:\/\//i.test(form.applicationLink))
      errs.applicationLink = "Link must start with http:// or https://";
    if (form.startDate && form.deadline && form.deadline < form.startDate)
      errs.deadline = "Deadline must be after the opening date";
    if (form.tuition < 0) errs.tuition = "Tuition cannot be negative";
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
      await createUniversity({
        cycleId: activeCycleId,
        name: form.name.trim(),
        region: form.region,
        tuition: form.tuition,
        currency: form.currency,
        startDate: form.startDate || null,
        deadline: form.deadline || null,
        applicationLink: form.applicationLink,
        notes: form.notes,
        status: form.status,
      });
      toast.success("University added", { description: form.name.trim() });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to add university", { description: e.message });
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
        className="bg-card rounded-xl border card-raised w-full sm:max-w-lg sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Add University
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
              University Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`${inputCls} ${fieldErrors.name ? "border-destructive focus-visible:border-destructive" : ""}`}
              placeholder="e.g. TU Delft"
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Region *
              </label>
              <select
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
                className={selectCls}
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={selectCls}
              >
                {UNI_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tuition
              </label>
              <input
                type="number"
                min={0}
                value={form.tuition}
                onChange={(e) => set("tuition", Number(e.target.value))}
                className={`${inputCls} ${fieldErrors.tuition ? "border-destructive" : ""}`}
              />
              {fieldErrors.tuition && (
                <p className="text-xs text-destructive mt-1">
                  {fieldErrors.tuition}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className={selectCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Opening Date
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
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className={`${inputCls} ${fieldErrors.deadline ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          {fieldErrors.deadline && (
            <p className="text-xs text-destructive -mt-2">
              {fieldErrors.deadline}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Application Link
            </label>
            <input
              value={form.applicationLink}
              onChange={(e) => set("applicationLink", e.target.value)}
              placeholder="https://..."
              className={`${inputCls} ${fieldErrors.applicationLink ? "border-destructive focus-visible:border-destructive" : ""}`}
            />
            {fieldErrors.applicationLink && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.applicationLink}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={textareaCls}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 border border-border rounded-md text-sm text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Add University"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function UniversityDetailDrawer({
  university,
  onClose,
  onUpdated,
  onDeleted,
}: {
  university: University;
  onClose: () => void;
  onUpdated: (u: University) => void;
  onDeleted: (id: string) => void;
}) {
  const { selectedCycleId, cycles } = useCycle();
  const cycleName = university.cycleId
    ? cycles.find((c) => c.id === university.cycleId)?.name
    : null;
  const showCycleBadge = selectedCycleId === null && cycleName;
  const [uni, setUni] = useState<University>(university);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notes, setNotes] = useState(university.notes ?? "");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [notesTimer, setNotesTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [editRegion, setEditRegion] = useState(university.region);
  const [editTuition, setEditTuition] = useState(
    String(university.tuition ?? 0),
  );
  const [editCurrency, setEditCurrency] = useState(
    university.currency ?? "USD",
  );
  const [editStartDate, setEditStartDate] = useState(
    university.startDate ?? "",
  );
  const [editDeadline, setEditDeadline] = useState(university.deadline ?? "");

  useEffect(() => {
    setUni(university);
    setNotes(university.notes ?? "");
    setEditRegion(university.region);
    setEditTuition(String(university.tuition ?? 0));
    setEditCurrency(university.currency ?? "USD");
    setEditStartDate(university.startDate ?? "");
    setEditDeadline(university.deadline ?? "");
  }, [university.id]);

  const saveField = async (field: string, value: any) => {
    setSavingField(field);
    try {
      await updateUniversity(uni.id, { [field]: value === "" ? null : value });
      const updated = { ...uni, [field]: value === "" ? null : value };
      setUni(updated);
      onUpdated(updated);
      toast.success("Saved", {
        description: `${field.replace(/([A-Z])/g, " $1").trim()} updated`,
      });
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    } finally {
      setSavingField(null);
    }
  };

  const completed = uni.checklist.filter((c) => c.completed).length;
  const total = uni.checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const handleStatusChange = async (status: ApplicationStatus) => {
    setSavingStatus(true);
    try {
      await updateUniversity(uni.id, { status });
      const updated = { ...uni, status };
      setUni(updated);
      onUpdated(updated);
      toast.success("Status updated", {
        description: statusConfig[status].label,
      });
    } catch (e: any) {
      toast.error("Failed to update status", { description: e.message });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer) clearTimeout(notesTimer);
    const t = setTimeout(async () => {
      setSavingNotes(true);
      try {
        await updateUniversity(uni.id, { notes: val });
        const updated = { ...uni, notes: val };
        setUni(updated);
        onUpdated(updated);
      } catch (e: any) {
        toast.error("Failed to save notes", { description: e.message });
      } finally {
        setSavingNotes(false);
      }
    }, 800);
    setNotesTimer(t);
  };

  const handleToggleCheck = async (itemId: string, checked: boolean) => {
    try {
      await updateChecklistItem(itemId, checked);
      const updated = {
        ...uni,
        checklist: uni.checklist.map((c) =>
          c.id === itemId ? { ...c, completed: checked } : c,
        ),
      };
      setUni(updated);
      onUpdated(updated);
    } catch (e: any) {
      toast.error("Failed to update checklist", { description: e.message });
    }
  };

  const handleAddCheck = async () => {
    if (!newCheckItem.trim()) return;
    try {
      const item = await addChecklistItem(uni.id, newCheckItem.trim());
      const updated = { ...uni, checklist: [...uni.checklist, item] };
      setUni(updated);
      onUpdated(updated);
      setNewCheckItem("");
      toast.success("Requirement added");
    } catch (e: any) {
      toast.error("Failed to add requirement", { description: e.message });
    }
  };

  const handleDeleteCheck = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      const updated = {
        ...uni,
        checklist: uni.checklist.filter((c) => c.id !== itemId),
      };
      setUni(updated);
      onUpdated(updated);
    } catch (e: any) {
      toast.error("Failed to remove requirement", { description: e.message });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUniversity(uni.id);
      toast.success("University deleted", { description: uni.name });
      onDeleted(uni.id);
    } catch (e: any) {
      toast.error("Failed to delete university", { description: e.message });
    }
  };

  const daysUntilDeadline = getDaysUntil(editDeadline || uni.deadline);
  const daysUntilOpen = getDaysUntil(editStartDate || uni.startDate);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed right-0 top-0 h-full w-full sm:max-w-2xl bg-card card-raised z-50 flex flex-col overflow-hidden border-l border-border"
      >
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-semibold text-card-foreground truncate">
              {uni.name}
            </h2>
            {showCycleBadge && (
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                {cycleName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete university"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Region
                </label>
                {savingField === "region" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <select
                value={editRegion}
                onChange={(e) => setEditRegion(e.target.value)}
                onBlur={() =>
                  editRegion !== uni.region && saveField("region", editRegion)
                }
                className={selectCls}
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Tuition Fee
                </label>
                {savingField === "tuition" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="grid grid-cols-[20%_80%] gap-1.5 w-full">
                <select
                  value={editCurrency}
                  onChange={(e) => {
                    setEditCurrency(e.target.value);
                    saveField("currency", e.target.value);
                  }}
                  className={`${selectCls} w-24 shrink-0`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={editTuition}
                  onChange={(e) => setEditTuition(e.target.value)}
                  onBlur={() => {
                    const val = Number(editTuition);
                    if (val !== uni.tuition) saveField("tuition", val);
                  }}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Opening Date
                </label>
                {savingField === "startDate" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                onBlur={() =>
                  editStartDate !== (uni.startDate ?? "") &&
                  saveField("startDate", editStartDate || null)
                }
                className={inputCls}
              />
              {daysUntilOpen !== null && daysUntilOpen > 0 && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--status-not-yet-open-strong)" }}
                >
                  Opens in {daysUntilOpen} days
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Deadline
                </label>
                {savingField === "deadline" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                onBlur={() =>
                  editDeadline !== (uni.deadline ?? "") &&
                  saveField("deadline", editDeadline || null)
                }
                className={`${inputCls} ${daysUntilDeadline !== null && daysUntilDeadline <= 14 ? "border-destructive text-destructive focus-visible:border-destructive" : ""}`}
              />
              {daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
                <p
                  className={`text-xs mt-1 tabular-nums ${daysUntilDeadline <= 14 ? "text-destructive font-medium" : daysUntilDeadline <= 30 ? "text-orange-600" : "text-muted-foreground"}`}
                >
                  {daysUntilDeadline} days left
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Application Status
            </label>
            <div className="flex flex-wrap gap-2">
              {UNI_STATUSES.map((status) => {
                const config = statusConfig[status];
                const isSelected = uni.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={savingStatus}
                    style={
                      isSelected
                        ? { borderColor: statusStrong[status] }
                        : undefined
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${isSelected ? `${config.color} ${config.bgColor}` : "bg-muted text-muted-foreground border-transparent hover:border-border"}`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-foreground">
                Requirements Progress
              </label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Requirements Checklist{" "}
              <span className="ml-2 text-xs text-muted-foreground font-normal tabular-nums">
                {completed}/{total}
              </span>
            </label>
            <div className="space-y-2">
              {uni.checklist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleCheck(item.id, !item.completed)}
                    className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                  <motion.span
                    initial={false}
                    animate={{ opacity: item.completed ? 0.6 : 1 }}
                    transition={{ duration: 0.15 }}
                    className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                  >
                    {item.item}
                  </motion.span>
                  <button
                    onClick={() => handleDeleteCheck(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCheck()}
                placeholder="Add new requirement..."
                className={`flex-1 ${inputCls}`}
              />
              <button
                onClick={handleAddCheck}
                className="px-4 h-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm"
              >
                <Plus className="size-4" />
                Add
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Notes
              </label>
              {savingNotes && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Saving…
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes about this application..."
              rows={4}
              className={textareaCls}
            />
          </div>

          {uni.applicationLink && (
            <a
              href={uni.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="size-4" />
              Visit Application Portal
            </a>
          )}

          {uni.scholarships && uni.scholarships.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Linked Scholarships
              </label>
              <div className="space-y-2">
                {uni.scholarships.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.currency} {s.amount?.toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={s.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          itemName={uni.name}
          itemType="university"
          onConfirm={() => {
            setShowDeleteModal(false);
            handleDelete();
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

export function Universities() {
  const {
    selectedCycleId,
    activeCycleId,
    cycles,
    loading: cyclesLoading,
  } = useCycle();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [sortKey, setSortKey] = useState<
    "name" | "region" | "deadline" | "progress"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // selectedCycleId of null means "All Cycles", so omit the filter
      setUniversities(await getUniversities(selectedCycleId ?? undefined));
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load universities", { description: e.message });
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId]);

  useEffect(() => {
    if (cyclesLoading) return;
    load();
  }, [load, cyclesLoading]);

  // The previously open item may not belong to the newly selected cycle,
  // so close the drawer rather than showing stale or out-of-scope data.
  useEffect(() => {
    setSelectedUni(null);
  }, [selectedCycleId]);

  const regions = useMemo(
    () => [...new Set(universities.map((u) => u.region))].sort(),
    [universities],
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, regionFilter]);

  const filtered = useMemo(
    () =>
      universities.filter((u) => {
        const matchSearch = u.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || u.status === statusFilter;
        const matchRegion = regionFilter === "all" || u.region === regionFilter;
        return matchSearch && matchStatus && matchRegion;
      }),
    [universities, searchQuery, statusFilter, regionFilter],
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "region") cmp = a.region.localeCompare(b.region);
      else if (sortKey === "deadline") {
        cmp =
          new Date(a.deadline ?? 0).getTime() -
          new Date(b.deadline ?? 0).getTime();
      } else if (sortKey === "progress") {
        const pct = (u: typeof a) =>
          u.checklist.length > 0
            ? u.checklist.filter((c) => c.completed).length / u.checklist.length
            : 0;
        cmp = pct(a) - pct(b);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  const handleUpdated = (updated: University) => {
    setUniversities((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u)),
    );
    if (selectedUni?.id === updated.id) setSelectedUni(updated);
  };

  const handleDeleted = (id: string) => {
    setUniversities((prev) => prev.filter((u) => u.id !== id));
    if (selectedUni?.id === id) setSelectedUni(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Universities
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your university applications and track progress
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-sm text-muted-foreground hidden sm:block tabular-nums">
              {filtered.length} of {universities.length} universities
            </div>
            <button
              onClick={load}
              aria-label="Refresh universities"
              className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!activeCycleId}
              title={
                !activeCycleId
                  ? "Create a cycle in Settings before adding a university"
                  : undefined
              }
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="size-4" />
              Add University
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        {!cyclesLoading && cycles.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-4 sm:mb-6">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            You don't have any application cycles yet. Create one in Settings to
            start adding universities.
          </div>
        )}

        <div className="bg-card rounded-xl border p-3 sm:p-4 mb-4 sm:mb-6 card-resting">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 ${inputCls}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ApplicationStatus | "all")
                }
                className={`${selectCls} w-auto pr-8`}
              >
                <option value="all">All Status</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className={`${selectCls} w-auto pr-8`}
              >
                <option value="all">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-card rounded-xl border card-resting overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {[
                      "University",
                      "Region",
                      "Status",
                      "Tuition Fee",
                      "Deadline",
                      "Progress",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-md" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-2 w-24 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl border p-12 text-center card-resting">
            <AlertCircle className="size-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={load}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border card-resting overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {[
                        { label: "University", key: "name" as const },
                        { label: "Region", key: "region" as const },
                        { label: "Status", key: null },
                        { label: "Tuition Fee", key: null },
                        { label: "Deadline", key: "deadline" as const },
                        { label: "Progress", key: "progress" as const },
                      ].map(({ label, key }) => (
                        <th
                          key={label}
                          onClick={key ? () => handleSort(key) : undefined}
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider select-none ${key ? "text-muted-foreground hover:text-foreground cursor-pointer transition-colors" : "text-muted-foreground"}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {label}
                            {key &&
                              (sortKey === key ? (
                                sortDir === "asc" ? (
                                  <ArrowUp
                                    className="size-3"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ArrowDown
                                    className="size-3"
                                    aria-hidden="true"
                                  />
                                )
                              ) : (
                                <ArrowUpDown
                                  className="size-3 opacity-40"
                                  aria-hidden="true"
                                />
                              ))}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginated.map((uni) => {
                      const progress =
                        uni.checklist.length > 0
                          ? (uni.checklist.filter((c) => c.completed).length /
                              uni.checklist.length) *
                            100
                          : 0;
                      const urgency = getDeadlineUrgency(uni.deadline);
                      const urgencyColors = {
                        urgent: "text-destructive font-semibold",
                        warning: "text-orange-600 font-medium",
                        normal: "text-muted-foreground",
                      };
                      return (
                        <motion.tr
                          key={uni.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedUni(uni)}
                          className={`hover:bg-muted/30 cursor-pointer transition-colors ${selectedUni?.id === uni.id ? "bg-muted/40" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">
                              {uni.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {uni.region}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={uni.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground tabular-nums">
                              {uni.currency}{" "}
                              {uni.tuition?.toLocaleString() ?? ":"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`text-sm tabular-nums ${urgencyColors[urgency]}`}
                            >
                              {uni.deadline
                                ? new Date(uni.deadline).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )
                                : ":"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2 max-w-24">
                                <div
                                  className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground min-w-10 tabular-nums">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <GraduationCap
                      className="size-10 text-muted-foreground/30 mx-auto mb-3"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-foreground mb-1">
                      {universities.length === 0
                        ? "No universities yet"
                        : "No universities found"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {universities.length === 0
                        ? "Start tracking your applications by adding a university."
                        : "Try adjusting your search or filters."}
                    </p>
                    {universities.length === 0 && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                        Add University
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground tabular-nums">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    aria-label="First page"
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                    )
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                        acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
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
                          onClick={() => setPage(p as number)}
                          aria-label={`Page ${p}`}
                          aria-current={page === p ? "page" : undefined}
                          className={`h-8 w-8 flex items-center justify-center rounded-md border text-sm transition-colors ${page === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    aria-label="Last page"
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mobile card list - visible on small screens only */}
        <div className="sm:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap
                className="size-10 text-muted-foreground/30 mx-auto mb-3"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-foreground mb-1">
                {universities.length === 0
                  ? "No universities yet"
                  : "No universities found"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {universities.length === 0
                  ? "Start tracking your applications by adding a university."
                  : "Try adjusting your search or filters."}
              </p>
              {universities.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add University
                </button>
              )}
            </div>
          ) : (
            paginated.map((uni) => {
              const urgency = getDeadlineUrgency(uni.deadline);
              const urgencyColors = {
                urgent: "text-destructive font-semibold",
                warning: "text-orange-600 font-medium",
                normal: "text-muted-foreground",
              };
              const progress =
                uni.checklist.length > 0
                  ? (uni.checklist.filter((c) => c.completed).length /
                      uni.checklist.length) *
                    100
                  : 0;
              return (
                <motion.div
                  key={uni.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedUni(uni)}
                  className={`bg-card rounded-xl border card-resting p-4 cursor-pointer hover:card-raised transition-shadow duration-200 ${selectedUni?.id === uni.id ? "ring-2 ring-ring" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="font-medium text-foreground">{uni.name}</p>
                    <StatusBadge status={uni.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{uni.region}</span>
                    <span className={`${urgencyColors[urgency]} tabular-nums`}>
                      {uni.deadline
                        ? new Date(uni.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No deadline"}
                    </span>
                  </div>
                  {uni.checklist.length > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span className="tabular-nums">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-brand-400 to-brand-600 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddUniversityModal
            key="add-modal"
            activeCycleId={activeCycleId}
            onClose={() => setShowAddModal(false)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedUni && (
          <UniversityDetailDrawer
            key={selectedUni.id}
            university={selectedUni}
            onClose={() => setSelectedUni(null)}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
