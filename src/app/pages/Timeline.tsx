import { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { University } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { statusConfig, getDaysUntil } from "../utils/statusConfig";
import { getUniversities } from "../../services/universities";

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

export function Timeline() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "active">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUniversities(await getUniversities());
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

  const sorted = useMemo(() => {
    let unis = universities.filter((u) => u.startDate && u.deadline);
    if (view === "active")
      unis = unis.filter((u) => !["accepted", "rejected"].includes(u.status));
    return unis.sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    );
  }, [universities, view]);

  const timelineData = useMemo(() => {
    if (sorted.length === 0) return { minDate: today, maxDate: today };
    const allDates = sorted.flatMap((u) => [
      new Date(u.startDate!),
      new Date(u.deadline!),
    ]);
    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    return { minDate: min, maxDate: max };
  }, [sorted]);

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
      universities
        .filter((u) => u.deadline && new Date(u.deadline) > today)
        .sort(
          (a, b) =>
            new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
        )
        .slice(0, 5),
    [universities],
  );

  const pastDeadlines = useMemo(
    () =>
      universities
        .filter((u) => u.deadline && new Date(u.deadline) <= today)
        .sort(
          (a, b) =>
            new Date(b.deadline!).getTime() - new Date(a.deadline!).getTime(),
        )
        .slice(0, 5),
    [universities],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize application periods and deadlines
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

      <div className="p-8 space-y-8">
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
        ) : sorted.length === 0 ? (
          <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
            <Calendar className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              {universities.length === 0
                ? "No universities yet. Add universities with opening and deadline dates to see the timeline."
                : "No universities with both opening and deadline dates."}
            </p>
          </div>
        ) : (
          /* Gantt Chart — matches original design structure */
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-1">
                Application Timeline Overview
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
              {sorted.map((uni) => {
                const openPct = toPercent(uni.startDate!);
                const widthPct = widthPercent(uni.startDate!, uni.deadline!);
                const daysLeft = getDaysUntil(uni.deadline);
                const color = STATUS_COLORS[uni.status] ?? "#9CA3AF";
                const config = statusConfig[uni.status];

                return (
                  <div key={uni.id} className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-foreground min-w-48 truncate">
                        {uni.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}
                      >
                        {config.label}
                      </span>
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
                          {new Date(uni.startDate!).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                          {" – "}
                          {new Date(uni.deadline!).toLocaleDateString("en-US", {
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
        )}

        {/* Upcoming + Past Deadlines — matches original two-panel layout */}
        {!loading && !error && universities.length > 0 && (
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
                  upcomingDeadlines.map((uni) => {
                    const daysUntil = getDaysUntil(uni.deadline);
                    return (
                      <div
                        key={uni.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {uni.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(uni.deadline!).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
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
                  pastDeadlines.map((uni) => (
                    <div
                      key={uni.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {uni.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(uni.deadline!).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <StatusBadge status={uni.status} size="sm" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
