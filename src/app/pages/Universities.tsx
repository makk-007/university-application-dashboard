import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Search, Filter, RefreshCw, ExternalLink, Trash2,
  AlertCircle, X, Check, Loader2,
} from 'lucide-react';
import { University, ApplicationStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { statusConfig, ALL_STATUSES, getDaysUntil, getDeadlineUrgency } from '../utils/statusConfig';
import {
  getUniversities, createUniversity, updateUniversity, deleteUniversity,
  addChecklistItem, updateChecklistItem, deleteChecklistItem,
} from '../../services/universities';

const REGIONS = ['North America', 'Europe', 'Asia', 'Oceania', 'Africa', 'South America', 'Middle East'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'SEK', 'GHS'];

// ── Shared input style matching the design system ─────────────────────────────
const inputCls = "flex h-9 w-full rounded-md border border-border bg-input-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] disabled:opacity-50";
const selectCls = `${inputCls} appearance-none`;

// ── Add University Modal ──────────────────────────────────────────────────────
function AddUniversityModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', region: 'Europe', tuition: 0, currency: 'USD',
    startDate: '', deadline: '', applicationLink: '', notes: '',
    status: 'not-started' as ApplicationStatus,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('University name is required'); return; }
    setSaving(true);
    try {
      await createUniversity({
        name: form.name.trim(), region: form.region, tuition: form.tuition,
        currency: form.currency, startDate: form.startDate || null,
        deadline: form.deadline || null, applicationLink: form.applicationLink,
        notes: form.notes, status: form.status,
      });
      onSaved(); onClose();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Add University</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="size-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">University Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="e.g. TU Delft" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Region *</label>
              <select value={form.region} onChange={e => set('region', e.target.value)} className={selectCls}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={selectCls}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tuition</label>
              <input type="number" min={0} value={form.tuition} onChange={e => set('tuition', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={selectCls}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Opening Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Application Link</label>
            <input type="url" value={form.applicationLink} onChange={e => set('applicationLink', e.target.value)} placeholder="https://..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              className="flex w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-border rounded-md text-sm text-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Add University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── University Detail Drawer ──────────────────────────────────────────────────
function UniversityDetailDrawer({
  university, onClose, onUpdated, onDeleted,
}: {
  university: University; onClose: () => void;
  onUpdated: (u: University) => void; onDeleted: (id: string) => void;
}) {
  const [uni, setUni] = useState<University>(university);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState(university.notes ?? '');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [notesTimer, setNotesTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setUni(university); setNotes(university.notes ?? ''); }, [university.id]);

  const completed = uni.checklist.filter(c => c.completed).length;
  const total = uni.checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const handleStatusChange = async (status: ApplicationStatus) => {
    setSavingStatus(true);
    await updateUniversity(uni.id, { status });
    const updated = { ...uni, status };
    setUni(updated); onUpdated(updated);
    setSavingStatus(false);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer) clearTimeout(notesTimer);
    const t = setTimeout(async () => {
      setSavingNotes(true);
      await updateUniversity(uni.id, { notes: val });
      const updated = { ...uni, notes: val };
      setUni(updated); onUpdated(updated);
      setSavingNotes(false);
    }, 800);
    setNotesTimer(t);
  };

  const handleToggleCheck = async (itemId: string, checked: boolean) => {
    await updateChecklistItem(itemId, checked);
    const updated = { ...uni, checklist: uni.checklist.map(c => c.id === itemId ? { ...c, completed: checked } : c) };
    setUni(updated); onUpdated(updated);
  };

  const handleAddCheck = async () => {
    if (!newCheckItem.trim()) return;
    const item = await addChecklistItem(uni.id, newCheckItem.trim());
    const updated = { ...uni, checklist: [...uni.checklist, item] };
    setUni(updated); onUpdated(updated);
    setNewCheckItem('');
  };

  const handleDeleteCheck = async (itemId: string) => {
    await deleteChecklistItem(itemId);
    const updated = { ...uni, checklist: uni.checklist.filter(c => c.id !== itemId) };
    setUni(updated); onUpdated(updated);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${uni.name}"? This cannot be undone.`)) return;
    await deleteUniversity(uni.id);
    onDeleted(uni.id);
  };

  const daysUntilDeadline = getDaysUntil(uni.deadline);
  const daysUntilOpen = getDaysUntil(uni.startDate);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Drawer — slides in from right, matches original max-w-2xl */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-50 flex flex-col overflow-hidden border-l border-border">
        {/* Sticky header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground truncate pr-4">{uni.name}</h2>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 className="size-4" />
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info grid — matching original design */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Region</label>
              <p className="text-sm text-foreground mt-1">{uni.region}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tuition Fee</label>
              <p className="text-sm text-foreground mt-1">{uni.currency} {uni.tuition?.toLocaleString() ?? '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Opening Date</label>
              <p className={`text-sm mt-1 ${daysUntilOpen !== null && daysUntilOpen > 0 ? 'text-sky-600' : 'text-foreground'}`}>
                {uni.startDate
                  ? new Date(uni.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
                {daysUntilOpen !== null && daysUntilOpen > 0 && (
                  <span className="ml-1.5 text-xs text-sky-500">({daysUntilOpen}d)</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Deadline</label>
              <p className={`text-sm mt-1 font-medium ${daysUntilDeadline !== null && daysUntilDeadline <= 14 ? 'text-destructive' : daysUntilDeadline !== null && daysUntilDeadline <= 30 ? 'text-orange-600' : 'text-foreground'}`}>
                {uni.deadline
                  ? new Date(uni.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
                {daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
                  <span className="ml-1.5 text-xs">({daysUntilDeadline} days left)</span>
                )}
              </p>
            </div>
          </div>

          {/* Status selector — button group like the original */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Application Status</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map(status => {
                const config = statusConfig[status];
                const isSelected = uni.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={savingStatus}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                      isSelected
                        ? `${config.color} ${config.bgColor} ${config.borderColor}`
                        : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-foreground">Requirements Progress</label>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Requirements Checklist
              <span className="ml-2 text-xs text-muted-foreground font-normal">{completed}/{total}</span>
            </label>
            <div className="space-y-2">
              {uni.checklist.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleCheck(item.id, !item.completed)}
                    className="size-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
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
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCheck()}
                placeholder="Add new requirement..."
                className={`flex-1 ${inputCls}`}
              />
              <button onClick={handleAddCheck}
                className="px-4 h-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm">
                <Plus className="size-4" />Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              {savingNotes && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />Saving…
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder="Add notes about this application..."
              rows={4}
              className="flex w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
            />
          </div>

          {/* Application link */}
          {uni.applicationLink && (
            <a
              href={uni.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="size-4" />Visit Application Portal
            </a>
          )}

          {/* Linked scholarships */}
          {uni.scholarships && uni.scholarships.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Linked Scholarships</label>
              <div className="space-y-2">
                {uni.scholarships.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.currency} {s.amount?.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={s.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Universities Page ────────────────────────────────────────────────────
export function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setUniversities(await getUniversities()); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const regions = useMemo(() => [...new Set(universities.map(u => u.region))].sort(), [universities]);

  const filtered = useMemo(() => universities.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchRegion = regionFilter === 'all' || u.region === regionFilter;
    return matchSearch && matchStatus && matchRegion;
  }), [universities, searchQuery, statusFilter, regionFilter]);

  const handleUpdated = (updated: University) => {
    setUniversities(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (selectedUni?.id === updated.id) setSelectedUni(updated);
  };

  const handleDeleted = (id: string) => {
    setUniversities(prev => prev.filter(u => u.id !== id));
    if (selectedUni?.id === id) setSelectedUni(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header — matches original Figma layout */}
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Universities</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your university applications and track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {filtered.length} of {universities.length} universities
            </div>
            <button onClick={load} className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <RefreshCw className="size-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />Add University
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Filters — matches original layout */}
        <div className="bg-card rounded-xl border p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 ${inputCls}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ApplicationStatus | 'all')} className={`${selectCls} w-auto pr-8`}>
                <option value="all">All Status</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
            <div>
              <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className={`${selectCls} w-auto pr-8`}>
                <option value="all">All Regions</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table — proper HTML table matching original */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
            <AlertCircle className="size-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button onClick={load} className="px-4 h-9 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">Retry</button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {['University', 'Region', 'Status', 'Tuition Fee', 'Deadline', 'Progress'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filtered.map(uni => {
                    const progress = uni.checklist.length > 0
                      ? (uni.checklist.filter(c => c.completed).length / uni.checklist.length) * 100 : 0;
                    const urgency = getDeadlineUrgency(uni.deadline);
                    const urgencyColors = {
                      urgent: 'text-destructive font-semibold',
                      warning: 'text-orange-600 font-medium',
                      normal: 'text-muted-foreground',
                    };
                    return (
                      <tr
                        key={uni.id}
                        onClick={() => setSelectedUni(uni)}
                        className={`hover:bg-muted/30 cursor-pointer transition-colors ${selectedUni?.id === uni.id ? 'bg-muted/40' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{uni.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{uni.region}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={uni.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">
                            {uni.currency} {uni.tuition?.toLocaleString() ?? '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${urgencyColors[urgency]}`}>
                            {uni.deadline
                              ? new Date(uni.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-24">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground min-w-10">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">
                    {universities.length === 0 ? 'No universities yet. Click "Add University" to get started.' : 'No universities found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddUniversityModal onClose={() => setShowAddModal(false)} onSaved={load} />}
      {selectedUni && (
        <UniversityDetailDrawer
          university={selectedUni}
          onClose={() => setSelectedUni(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
