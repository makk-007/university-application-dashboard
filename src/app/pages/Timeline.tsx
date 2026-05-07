import { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { University, Scholarship } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { statusConfig, getDaysUntil } from "../utils/statusConfig";
import { getUniversities } from "../../services/universities";
import { getScholarships } from "../../services/scholarships";

const STATUS_COLORS: Record<string, string> = {
  "not-yet-open": "#0EA5E9",
  "not-started": "#9CA3AF",
  "in-progress": "#3B82F6",
  submitted: "#A855F7",
  accepted: "#10B981",
  rejected: "#EF4444",
  waitlisted: "#F59E0B",
  awarded: "#059669",
};

// ── Shared shape for both university and scholarship timeline items ────────────
interface TimelineItem {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  deadline: string | null;
}

// ── Reusable Gantt + deadline panels ─────────────────────────────────────────
interface TimelineViewProps {
  items: TimelineItem[];
  allItems: TimelineItem[];
  view: "all" | "active";
  emptyMessage: string;
  ganttTitle: string;
  activeFilterLabel?: string;
}

function TimelineView({
  items, // already filtered by view
  allItems, // full set (for upcoming/past panels)
  view,
  emptyMessage,
  ganttTitle,
}: TimelineViewProps) {
  const today = new Date();

  const timelineData = useMemo(() => {
    if (items.length === 0) return { minDate: today, maxDate: today };
    const allDates = items.flatMap((i) => [
      new Date(i.startDate!),
      new Date(i.deadline!),
    ]);
    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    return { minDate: min, maxDate: max };
  }, [items]);

  const rangeMs =
    timelineData.maxDate.getTime() - timelineData.minDate.getTime() || 1;

  const toPercent = (date: string) => {
    const t = new Date(date).getTime();
    return Math.max(
      0,
      Math.min(100, ((t - timelineData.minDate.getTime()) / rangeMs) * 100),
    );
  };

  const widthPercent = (start: string, end: string) => {
    const s = Math.max(
      timelineData.minDate.getTime(),
      new Date(start).getTime(),
    );
    const e = Math.min(timelineData.maxDate.getTime(), new Date(end).getTime());
    return Math.max(0.5, ((e - s) / rangeMs) * 100);
  };

  const todayPercent =
    ((today.getTime() - timelineData.minDate.getTime()) / rangeMs) * 100;

  const upcomingDeadlines = useMemo(
    () =>
      allItems
        .filter((i) => i.deadline && new Date(i.deadline) > today)
        .sort(
          (a, b) =>
            new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
        )
        .slice(0, 5),
    [allItems],
  );

  const pastDeadlines = useMemo(
    () =>
      allItems
        .filter((i) => i.deadline && new Date(i.deadline) <= today)
        .sort(
          (a, b) =>
            new Date(b.deadline!).getTime() - new Date(a.deadline!).getTime(),
        )
        .slice(0, 5),
    [allItems],
  );

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
        <Calendar className="size-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gantt chart */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-1">
            {ganttTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            Timeline from{" "}
            {timelineData.minDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}{" "}
            to{" "}
            {timelineData.maxDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-5">
          {items.map((item) => {
            const openPct = toPercent(item.startDate!);
            const widthPct = widthPercent(item.startDate!, item.deadline!);
            const color = STATUS_COLORS[item.status] ?? "#9CA3AF";
            const config =
              statusConfig[item.status as keyof typeof statusConfig];

            return (
              <div key={item.id} className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-foreground min-w-48 truncate">
                    {item.name}
                  </span>
                  {config && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}
                    >
                      {config.label}
                    </span>
                  )}
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute h-full rounded-lg flex items-center px-2 overflow-hidden"
                    style={{
                      left: `${openPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: color + "33",
                      border: `2px solid ${color}`,
                    }}
                  >
                    <span className="text-xs font-medium text-foreground truncate">
                      {new Date(item.startDate!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {" – "}
                      {new Date(item.deadline!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {todayPercent >= 0 && todayPercent <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                      style={{ left: `${todayPercent}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 bg-destructive rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global today marker */}
        <div className="relative mt-8 pt-4 border-t border-border">
          <div className="h-2 bg-muted rounded-full relative">
            {todayPercent >= 0 && todayPercent <= 100 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${todayPercent}%` }}
              >
                <div className="size-3 bg-destructive rounded-full mb-1" />
                <div className="text-xs font-medium text-destructive whitespace-nowrap mt-2">
                  Today
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">
                {statusConfig[status as keyof typeof statusConfig]?.label ??
                  status}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-px h-3.5 bg-destructive" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
        </div>
      </div>

      {/* Upcoming + Past Deadlines */}
      {allItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines
                </p>
              ) : (
                upcomingDeadlines.map((item) => {
                  const daysUntil = getDaysUntil(item.deadline);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.deadline!).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${daysUntil !== null && daysUntil < 14 ? "text-destructive" : daysUntil !== null && daysUntil < 30 ? "text-orange-600" : "text-blue-600"}`}
                        >
                          {daysUntil} days
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Past Deadlines
            </h2>
            <div className="space-y-3">
              {pastDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No past deadlines
                </p>
              ) : (
                pastDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.deadline!).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={item.status as any} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Timeline Page ────────────────────────────────────────────────────────
export function Timeline() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"applications" | "scholarships">(
    "applications",
  );
  const [view, setView] = useState<"all" | "active">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [unis, schols] = await Promise.all([
        getUniversities(),
        getScholarships(),
      ]);
      setUniversities(unis);
      setScholarships(schols);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load timeline", { description: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date();

  // ── University timeline items ───────────────────────────────────────────────
  const uniItems: TimelineItem[] = useMemo(
    () =>
      universities
        .filter((u) => u.startDate && u.deadline)
        .map((u) => ({
          id: u.id,
          name: u.name,
          status: u.status,
          startDate: u.startDate,
          deadline: u.deadline,
        })),
    [universities],
  );

  const filteredUniItems = useMemo(() => {
    if (view === "active")
      return uniItems.filter(
        (i) => !["accepted", "rejected"].includes(i.status),
      );
    return uniItems;
  }, [uniItems, view]);

  const sortedUniItems = useMemo(
    () =>
      [...filteredUniItems].sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
      ),
    [filteredUniItems],
  );

  // ── Scholarship timeline items ──────────────────────────────────────────────
  const scholItems: TimelineItem[] = useMemo(
    () =>
      scholarships
        .filter((s) => s.startDate && s.deadline)
        .map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          startDate: s.startDate ?? null,
          deadline: s.deadline ?? null,
        })),
    [scholarships],
  );

  const filteredScholItems = useMemo(() => {
    if (view === "active")
      return scholItems.filter(
        (i) => !["awarded", "rejected"].includes(i.status),
      );
    return scholItems;
  }, [scholItems, view]);

  const sortedScholItems = useMemo(
    () =>
      [...filteredScholItems].sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
      ),
    [filteredScholItems],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize application and scholarship periods
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              Today:{" "}
              {today.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {/* All / Active filter */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {(["all", "active"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {v === "all" ? "All" : "Active Only"}
                </button>
              ))}
            </div>
            <button
              onClick={load}
              className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Tab switcher : same pattern as Scholarships page */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setTab("applications")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "applications" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Application Timeline
          </button>
          <button
            onClick={() => setTab("scholarships")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "scholarships" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Scholarship Timeline
          </button>
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
        ) : tab === "applications" ? (
          <TimelineView
            items={sortedUniItems}
            allItems={uniItems}
            view={view}
            ganttTitle="Application Timeline Overview"
            emptyMessage={
              universities.length === 0
                ? "No universities yet. Add universities with opening and deadline dates to see the timeline."
                : "No universities have both an opening date and a deadline."
            }
          />
        ) : (
          <TimelineView
            items={sortedScholItems}
            allItems={scholItems}
            view={view}
            ganttTitle="Scholarship Timeline Overview"
            emptyMessage={
              scholarships.length === 0
                ? "No scholarships yet. Add scholarships with opening and deadline dates to see the timeline."
                : "No scholarships have both an opening date and a deadline."
            }
          />
        )}
      </div>
    </div>
  );
}
