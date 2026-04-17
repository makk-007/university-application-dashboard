import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertCircle,
  X,
  Check,
  Loader2,
  DollarSign,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  Scholarship,
  ApplicationStatus,
  University,
  FX_TO_GHS,
} from "../types";
import { StatusBadge } from "../components/StatusBadge";
import {
  statusConfig,
  ALL_STATUSES,
  getDaysUntil,
  getDeadlineUrgency,
} from "../utils/statusConfig";
import {
  getScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  addScholarshipChecklistItem,
  updateScholarshipChecklistItem,
  deleteScholarshipChecklistItem,
  setScholarshipUniversities,
} from "../../services/scholarships";
import { getUniversities } from "../../services/universities";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CURRENCIES = ["USD", "EUR", "GBP", "SEK", "GHS"];
const COVERAGE_OPTIONS = [
  "Full Scholarship",
  "Tuition Only",
  "Stipend Only",
  "Tuition + Stipend",
] as const;
const inputCls =
  "flex h-9 w-full rounded-md border border-border bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]";
const selectCls = `${inputCls} appearance-none`;

function AddScholarshipModal({
  onClose,
  onSaved,
  universities,
}: {
  onClose: () => void;
  onSaved: () => void;
  universities: University[];
}) {
  const [form, setForm] = useState({
    name: "",
    amount: 0,
    currency: "GHS",
    coverage: "Full Scholarship" as (typeof COVERAGE_OPTIONS)[number],
    status: "not-started" as ApplicationStatus,
    notes: "",
    link: "",
    startDate: "",
    deadline: "",
    eligibleUniversities: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleUni = (id: string) =>
    setForm((f) => ({
      ...f,
      eligibleUniversities: f.eligibleUniversities.includes(id)
        ? f.eligibleUniversities.filter((x) => x !== id)
        : [...f.eligibleUniversities, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Scholarship name is required");
      return;
    }
    setSaving(true);
    try {
      await createScholarship({
        name: form.name.trim(),
        amount: form.amount,
        currency: form.currency,
        coverage: form.coverage,
        status: form.status,
        notes: form.notes,
        link: form.link,
        startDate: form.startDate || null,
        deadline: form.deadline || null,
        eligibleUniversities: form.eligibleUniversities,
      });
      toast.success("Scholarship added", { description: form.name.trim() });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to add scholarship", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Add Scholarship
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Scholarship Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              placeholder="e.g. Mastercard Foundation Scholarship"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Amount
              </label>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => set("amount", Number(e.target.value))}
                className={inputCls}
              />
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={selectCls}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Coverage
            </label>
            <select
              value={form.coverage}
              onChange={(e) => set("coverage", e.target.value)}
              className={selectCls}
            >
              {COVERAGE_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
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
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          {universities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Eligible Universities
              </label>
              <div className="border border-border rounded-md max-h-40 overflow-y-auto p-2 space-y-1 bg-muted/20">
                {universities.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                  >
                    <div
                      onClick={() => toggleUni(u.id)}
                      className={`size-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${form.eligibleUniversities.includes(u.id) ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                    >
                      {form.eligibleUniversities.includes(u.id) && (
                        <Check className="size-3" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Scholarship Link
            </label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="flex w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
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
              {saving ? "Saving…" : "Add Scholarship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScholarshipDetailDrawer({
  scholarship,
  universities,
  onClose,
  onUpdated,
  onDeleted,
}: {
  scholarship: Scholarship;
  universities: University[];
  onClose: () => void;
  onUpdated: (s: Scholarship) => void;
  onDeleted: (id: string) => void;
}) {
  const [s, setS] = useState<Scholarship>(scholarship);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [notes, setNotes] = useState(scholarship.notes ?? "");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [notesTimer, setNotesTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [editCoverage, setEditCoverage] = useState(scholarship.coverage);
  const [editAmount, setEditAmount] = useState(String(scholarship.amount ?? 0));
  const [editCurrency, setEditCurrency] = useState(
    scholarship.currency ?? "GHS",
  );
  const [editStartDate, setEditStartDate] = useState(
    scholarship.startDate ?? "",
  );
  const [editDeadline, setEditDeadline] = useState(scholarship.deadline ?? "");

  useEffect(() => {
    setS(scholarship);
    setNotes(scholarship.notes ?? "");
    setEditCoverage(scholarship.coverage);
    setEditAmount(String(scholarship.amount ?? 0));
    setEditCurrency(scholarship.currency ?? "GHS");
    setEditStartDate(scholarship.startDate ?? "");
    setEditDeadline(scholarship.deadline ?? "");
  }, [scholarship.id]);

  const saveField = async (field: string, value: any) => {
    setSavingField(field);
    try {
      await updateScholarship(s.id, { [field]: value === "" ? null : value });
      const updated = { ...s, [field]: value === "" ? null : value };
      setS(updated);
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

  const completed = s.checklist.filter((c) => c.completed).length;
  const total = s.checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const handleStatusChange = async (status: ApplicationStatus) => {
    setSavingStatus(true);
    try {
      await updateScholarship(s.id, { status });
      const updated = { ...s, status };
      setS(updated);
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
        await updateScholarship(s.id, { notes: val });
        const updated = { ...s, notes: val };
        setS(updated);
        onUpdated(updated);
      } catch (e: any) {
        toast.error("Failed to save notes", { description: e.message });
      } finally {
        setSavingNotes(false);
      }
    }, 800);
    setNotesTimer(t);
  };
  const handleToggleUni = async (uniId: string) => {
    const newList = s.eligibleUniversities.includes(uniId)
      ? s.eligibleUniversities.filter((x) => x !== uniId)
      : [...s.eligibleUniversities, uniId];
    try {
      await setScholarshipUniversities(s.id, newList);
      const updated = { ...s, eligibleUniversities: newList };
      setS(updated);
      onUpdated(updated);
    } catch (e: any) {
      toast.error("Failed to update universities", { description: e.message });
    }
  };
  const handleToggleCheck = async (itemId: string, checked: boolean) => {
    try {
      await updateScholarshipChecklistItem(itemId, checked);
      const updated = {
        ...s,
        checklist: s.checklist.map((c) =>
          c.id === itemId ? { ...c, completed: checked } : c,
        ),
      };
      setS(updated);
      onUpdated(updated);
    } catch (e: any) {
      toast.error("Failed to update checklist", { description: e.message });
    }
  };
  const handleAddCheck = async () => {
    if (!newCheckItem.trim()) return;
    try {
      const item = await addScholarshipChecklistItem(s.id, newCheckItem.trim());
      const updated = { ...s, checklist: [...s.checklist, item] };
      setS(updated);
      onUpdated(updated);
      setNewCheckItem("");
      toast.success("Requirement added");
    } catch (e: any) {
      toast.error("Failed to add requirement", { description: e.message });
    }
  };
  const handleDeleteCheck = async (itemId: string) => {
    try {
      await deleteScholarshipChecklistItem(itemId);
      const updated = {
        ...s,
        checklist: s.checklist.filter((c) => c.id !== itemId),
      };
      setS(updated);
      onUpdated(updated);
    } catch (e: any) {
      toast.error("Failed to remove requirement", { description: e.message });
    }
  };
  const handleDelete = async () => {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    try {
      await deleteScholarship(s.id);
      toast.success("Scholarship deleted", { description: s.name });
      onDeleted(s.id);
    } catch (e: any) {
      toast.error("Failed to delete scholarship", { description: e.message });
    }
  };

  const amountGHS = (Number(editAmount) || 0) * (FX_TO_GHS[editCurrency] ?? 1);
  const daysUntilDeadline = getDaysUntil((editDeadline || s.deadline) ?? null);
  const daysUntilOpen = getDaysUntil((editStartDate || s.startDate) ?? null);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-50 flex flex-col overflow-hidden border-l border-border">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground truncate pr-4">
            {s.name}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Coverage
                </label>
                {savingField === "coverage" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <select
                value={editCoverage}
                onChange={(e) => {
                  setEditCoverage(
                    e.target.value as (typeof COVERAGE_OPTIONS)[number],
                  );
                  saveField("coverage", e.target.value);
                }}
                className={selectCls}
              >
                {COVERAGE_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Amount
                </label>
                {savingField === "amount" && (
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
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  onBlur={() => {
                    const val = Number(editAmount);
                    if (val !== s.amount) saveField("amount", val);
                  }}
                  className={inputCls}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ GHS{" "}
                {amountGHS.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </p>
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
                  editStartDate !== (s.startDate ?? "") &&
                  saveField("startDate", editStartDate || null)
                }
                className={inputCls}
              />
              {daysUntilOpen !== null && daysUntilOpen > 0 && (
                <p className="text-xs text-sky-600 mt-1">
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
                  editDeadline !== (s.deadline ?? "") &&
                  saveField("deadline", editDeadline || null)
                }
                className={`${inputCls} ${daysUntilDeadline !== null && daysUntilDeadline <= 14 ? "border-destructive" : ""}`}
              />
              {daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
                <p
                  className={`text-xs mt-1 ${daysUntilDeadline <= 14 ? "text-destructive font-medium" : daysUntilDeadline <= 30 ? "text-orange-600" : "text-muted-foreground"}`}
                >
                  {daysUntilDeadline} days left
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => {
                const config = statusConfig[status];
                const isSelected = s.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={savingStatus}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${isSelected ? `${config.color} ${config.bgColor} ${config.borderColor}` : "bg-muted text-muted-foreground border-transparent hover:border-border"}`}
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
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Requirements Checklist{" "}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                {completed}/{total}
              </span>
            </label>
            <div className="space-y-2">
              {s.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleCheck(item.id, !item.completed)}
                    className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                  >
                    {item.item}
                  </span>
                  <button
                    onClick={() => handleDeleteCheck(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
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
              rows={4}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes about this scholarship..."
              className="flex w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
            />
          </div>

          {s.link && (
            <a
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="size-4" />
              Visit Scholarship Website
            </a>
          )}

          {universities.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Eligible Universities
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {universities.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                  >
                    <div
                      onClick={() => handleToggleUni(u.id)}
                      className={`size-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${s.eligibleUniversities.includes(u.id) ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-ring"}`}
                    >
                      {s.eligibleUniversities.includes(u.id) && (
                        <Check className="size-3" />
                      )}
                    </div>
                    <span className="text-sm text-foreground truncate">
                      {u.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<Scholarship | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "funding">("list");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schols, unis] = await Promise.all([
        getScholarships(),
        getUniversities(),
      ]);
      setScholarships(schols);
      setUniversities(unis);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load scholarships", { description: e.message });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      scholarships.filter((s) => {
        const matchSearch = s.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [scholarships, searchQuery, statusFilter],
  );
  const fundingData = useMemo(
    () =>
      universities
        .map((u) => ({
          name: u.name.length > 22 ? u.name.slice(0, 22) + "…" : u.name,
          value: Math.round(
            scholarships
              .filter((s) => s.eligibleUniversities.includes(u.id))
              .reduce(
                (sum, s) =>
                  sum + (s.amount ?? 0) * (FX_TO_GHS[s.currency] ?? 1),
                0,
              ),
          ),
        }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [scholarships, universities],
  );
  const totalPotential = useMemo(
    () =>
      scholarships.reduce(
        (t, s) => t + (s.amount ?? 0) * (FX_TO_GHS[s.currency] ?? 1),
        0,
      ),
    [scholarships],
  );
  const handleUpdated = (updated: Scholarship) => {
    setScholarships((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
    if (selected?.id === updated.id) setSelected(updated);
  };
  const handleDeleted = (id: string) => {
    setScholarships((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Scholarships
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track scholarship opportunities and funding sources
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="size-4 text-green-600" />
              <span>
                Total Potential: GHS{" "}
                {totalPotential.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <button
              onClick={load}
              className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />
              Add Scholarship
            </button>
          </div>
        </div>
      </header>
      <div className="p-8 space-y-6">
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {(["list", "funding"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "list" ? "Scholarships List" : "💰 Funding Overview"}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
            <AlertCircle className="size-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={load}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : activeTab === "list" ? (
          <>
            <div className="bg-card rounded-xl border p-4 shadow-sm">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search scholarships..."
                    className={`w-full pl-9 ${inputCls}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as ApplicationStatus | "all",
                      )
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
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
                <DollarSign className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {scholarships.length === 0
                    ? 'No scholarships yet. Click "Add Scholarship" to get started.'
                    : "No scholarships found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((schol) => {
                  const urgency = getDeadlineUrgency(schol.deadline ?? null);
                  const urgencyBorder = {
                    urgent: "border-l-destructive bg-destructive/5",
                    warning: "border-l-orange-500 bg-orange-50",
                    normal: "border-l-blue-500 bg-blue-50",
                  };
                  const eligNames = universities
                    .filter((u) => schol.eligibleUniversities.includes(u.id))
                    .map((u) => u.name);
                  const progress =
                    schol.checklist.length > 0
                      ? (schol.checklist.filter((c) => c.completed).length /
                          schol.checklist.length) *
                        100
                      : 0;
                  return (
                    <div
                      key={schol.id}
                      onClick={() => setSelected(schol)}
                      className={`bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer ${selected?.id === schol.id ? "ring-2 ring-ring" : ""}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-base font-semibold text-card-foreground flex-1 pr-2">
                            {schol.name}
                          </h3>
                          <StatusBadge status={schol.status} size="sm" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Funding Amount
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              {schol.currency} {schol.amount?.toLocaleString()}
                            </span>
                          </div>
                          {schol.deadline && (
                            <div
                              className={`border-l-4 ${urgencyBorder[urgency]} p-3 rounded-r-lg`}
                            >
                              <p className="text-xs text-muted-foreground">
                                Deadline
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {new Date(schol.deadline).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          )}
                          {schol.checklist.length > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Requirements</span>
                                <span>
                                  {
                                    schol.checklist.filter((c) => c.completed)
                                      .length
                                  }
                                  /{schol.checklist.length}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {eligNames.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Eligible Universities
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {eligNames.slice(0, 2).map((n) => (
                                  <span
                                    key={n}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium bg-secondary text-secondary-foreground"
                                  >
                                    {n.length > 20 ? n.slice(0, 20) + "…" : n}
                                  </span>
                                ))}
                                {eligNames.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{eligNames.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-muted/30 px-6 py-3 border-t border-border">
                        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {fundingData.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
                <p className="text-muted-foreground text-sm">
                  No funding data yet. Link scholarships to universities to see
                  totals.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card rounded-xl border p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-card-foreground mb-1">
                    Total Potential Funding per University (GHS)
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    All scholarship amounts converted to GHS
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={fundingData}
                      margin={{ top: 10, right: 10, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        angle={-35}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v) => [
                          `GHS ${Number(v).toLocaleString()}`,
                          "Funding",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill="#3B82F6"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          University
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total Funding (GHS)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {fundingData.map((d) => (
                        <tr
                          key={d.name}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-3 text-sm text-foreground">
                            {d.name}
                          </td>
                          <td className="px-6 py-3 text-sm font-semibold text-blue-600 text-right">
                            GHS {d.value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {showAddModal && (
        <AddScholarshipModal
          onClose={() => setShowAddModal(false)}
          onSaved={load}
          universities={universities}
        />
      )}
      {selected && (
        <ScholarshipDetailDrawer
          scholarship={selected}
          universities={universities}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
