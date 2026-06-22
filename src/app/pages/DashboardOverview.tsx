import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GraduationCap,
  FileText,
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CalendarClock,
  CalendarPlus,
  Bell,
  BellOff,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { KPICard } from "../components/KPICard";
import { StatusBadge } from "../components/StatusBadge";
import { Skeleton } from "../components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  statusConfig,
  statusStrong,
  getDeadlineUrgency,
  getDaysUntil,
} from "../utils/statusConfig";
import {
  getNotificationPermission,
  requestNotificationPermission,
  notifyUpcomingDeadlines,
} from "../utils/notifications";
import { exportDeadlinesToIcs } from "../utils/icsExport";
import { getUniversities } from "../../services/universities";
import { getScholarships } from "../../services/scholarships";
import { University, Scholarship, FX_TO_GHS } from "../types";
import { useCycle } from "../context/CycleContext";

export function DashboardOverview() {
  const { selectedCycleId, cycles, loading: cyclesLoading } = useCycle();
  const [universities, setUniversities] = useState<University[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission(),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // selectedCycleId of null means "All Cycles", so omit the filter
      const [unis, schols] = await Promise.all([
        getUniversities(selectedCycleId ?? undefined),
        getScholarships(selectedCycleId ?? undefined),
      ]);
      setUniversities(unis);
      setScholarships(schols);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load dashboard", { description: e.message });
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId]);
  useEffect(() => {
    if (cyclesLoading) return;
    load();
  }, [load, cyclesLoading]);

  const selectedCycleName = useMemo(() => {
    if (!selectedCycleId) return "All Cycles";
    return cycles.find((c) => c.id === selectedCycleId)?.name ?? "All Cycles";
  }, [cycles, selectedCycleId]);

  const stats = useMemo(
    () => ({
      total: universities.length,
      notYetOpen: universities.filter((u) => u.status === "not-yet-open")
        .length,
      notStarted: universities.filter((u) => u.status === "not-started").length,
      inProgress: universities.filter((u) => u.status === "in-progress").length,
      submitted: universities.filter((u) => u.status === "submitted").length,
      accepted: universities.filter((u) => u.status === "accepted").length,
      rejected: universities.filter((u) => u.status === "rejected").length,
      waitlisted: universities.filter((u) => u.status === "waitlisted").length,
    }),
    [universities],
  );

  const cycleBreakdown = useMemo(() => {
    if (selectedCycleId !== null) return [];
    return cycles
      .map((cycle) => {
        const cycleUnis = universities.filter((u) => u.cycleId === cycle.id);
        const cycleSchols = scholarships.filter((s) => s.cycleId === cycle.id);
        return {
          cycle,
          total: cycleUnis.length,
          accepted: cycleUnis.filter((u) => u.status === "accepted").length,
          rejected: cycleUnis.filter((u) => u.status === "rejected").length,
          pending: cycleUnis.filter(
            (u) =>
              u.status !== "accepted" &&
              u.status !== "rejected" &&
              u.status !== "waitlisted" &&
              u.status !== "withdrawn",
          ).length,
          scholarshipCount: cycleSchols.length,
        };
      })
      .filter((row) => row.total > 0 || row.scholarshipCount > 0);
  }, [cycles, universities, scholarships, selectedCycleId]);

  const pieData = [
    {
      name: "Not Yet Open",
      value: stats.notYetOpen,
      color: statusStrong["not-yet-open"],
    },
    {
      name: "Not Started",
      value: stats.notStarted,
      color: statusStrong["not-started"],
    },
    {
      name: "In Progress",
      value: stats.inProgress,
      color: statusStrong["in-progress"],
    },
    {
      name: "Submitted",
      value: stats.submitted,
      color: statusStrong["submitted"],
    },
    {
      name: "Accepted",
      value: stats.accepted,
      color: statusStrong["accepted"],
    },
    {
      name: "Rejected",
      value: stats.rejected,
      color: statusStrong["rejected"],
    },
    {
      name: "Waitlisted",
      value: stats.waitlisted,
      color: statusStrong["waitlisted"],
    },
  ].filter((d) => d.value > 0);

  const barData = [
    {
      status: "Not Open",
      count: stats.notYetOpen,
      fill: statusStrong["not-yet-open"],
    },
    {
      status: "Not Started",
      count: stats.notStarted,
      fill: statusStrong["not-started"],
    },
    {
      status: "In Progress",
      count: stats.inProgress,
      fill: statusStrong["in-progress"],
    },
    {
      status: "Submitted",
      count: stats.submitted,
      fill: statusStrong["submitted"],
    },
    {
      status: "Accepted",
      count: stats.accepted,
      fill: statusStrong["accepted"],
    },
    {
      status: "Rejected",
      count: stats.rejected,
      fill: statusStrong["rejected"],
    },
    {
      status: "Waitlisted",
      count: stats.waitlisted,
      fill: statusStrong["waitlisted"],
    },
  ].filter((d) => d.count > 0);

  // ── Upcoming deadlines : universities + scholarships ────────────────────────
  // Strict rule: only "In Progress" items with a deadline within the next 15
  // days (inclusive) qualify. Not yet open, not started, submitted, accepted,
  // rejected, waitlisted, awarded, and anything past 15 days out are excluded.
  const UPCOMING_DEADLINE_WINDOW_DAYS = 15;
  const upcomingDeadlines = useMemo(() => {
    const isWithinWindow = (deadline: string | null | undefined) => {
      const days = getDaysUntil(deadline ?? null);
      return (
        days !== null && days >= 0 && days <= UPCOMING_DEADLINE_WINDOW_DAYS
      );
    };
    const uniDeadlines = universities
      .filter((u) => u.status === "in-progress" && isWithinWindow(u.deadline))
      .map((u) => ({
        id: u.id,
        name: u.name,
        deadline: u.deadline!,
        status: u.status,
        type: "university" as const,
      }));
    const scholDeadlines = scholarships
      .filter((s) => s.status === "in-progress" && isWithinWindow(s.deadline))
      .map((s) => ({
        id: s.id,
        name: s.name,
        deadline: s.deadline!,
        status: s.status,
        type: "scholarship" as const,
      }));
    return [...uniDeadlines, ...scholDeadlines].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );
  }, [universities, scholarships]);

  // Show a browser notification for newly-urgent deadlines, once per item
  // per day, only if the person has already granted permission. This
  // fires while the app is open; it is not background push (no service
  // worker), so it only catches deadlines while the dashboard is loaded.
  useEffect(() => {
    if (loading || upcomingDeadlines.length === 0) return;
    notifyUpcomingDeadlines(
      upcomingDeadlines.map((d) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        daysUntil: getDaysUntil(d.deadline) ?? 0,
      })),
    );
  }, [loading, upcomingDeadlines]);

  // Broader than upcomingDeadlines: every future deadline regardless of
  // status (excluding fully resolved outcomes), since a calendar export is
  // a forward-looking reference rather than an urgency list.
  const allUpcomingDeadlines = useMemo(() => {
    const RESOLVED_STATUSES = ["accepted", "rejected", "withdrawn", "awarded"];
    const isFutureAndOpen = (
      status: string,
      deadline: string | null | undefined,
    ) => {
      if (RESOLVED_STATUSES.includes(status)) return false;
      const days = getDaysUntil(deadline ?? null);
      return days !== null && days >= 0;
    };
    const uniEvents = universities
      .filter((u) => isFutureAndOpen(u.status, u.deadline))
      .map((u) => ({
        id: u.id,
        type: "university" as const,
        name: u.name,
        deadline: u.deadline!,
      }));
    const scholEvents = scholarships
      .filter((s) => isFutureAndOpen(s.status, s.deadline))
      .map((s) => ({
        id: s.id,
        type: "scholarship" as const,
        name: s.name,
        deadline: s.deadline!,
      }));
    return [...uniEvents, ...scholEvents];
  }, [universities, scholarships]);

  const openingSoon = useMemo(() => {
    const today = new Date();
    return universities
      .filter((u) => {
        if (!u.startDate) return false;
        const days = getDaysUntil(u.startDate);
        return new Date(u.startDate) > today && days !== null && days <= 30;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate ?? 0).getTime() -
          new Date(b.startDate ?? 0).getTime(),
      )
      .slice(0, 3);
  }, [universities]);

  // ── Upcoming Applications : all not-yet-open universities, soonest first ──
  const upcomingApplications = useMemo(() => {
    return universities
      .filter((u) => u.status === "not-yet-open")
      .sort((a, b) => {
        // Universities with a known opening date come first, soonest first.
        // Universities with no startDate yet are pushed to the end.
        if (!a.startDate && !b.startDate) return a.name.localeCompare(b.name);
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      });
  }, [universities]);

  const totalFundingGHS = useMemo(
    () =>
      scholarships.reduce(
        (t, s) => t + (s.amount ?? 0) * (FX_TO_GHS[s.currency] ?? 1),
        0,
      ),
    [scholarships],
  );

  const totalSecuredGHS = useMemo(
    () =>
      scholarships
        .filter((s) => s.status === "awarded")
        .reduce(
          (t, s) => t + (s.amount ?? 0) * (FX_TO_GHS[s.currency] ?? 1),
          0,
        ),
    [scholarships],
  );

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 sm:px-8 py-4 sm:py-6">
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </header>
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border p-5 card-resting space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-9 w-12" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border card-resting p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <Skeleton className="h-[280px] w-full rounded-lg" />
              </div>
              <div className="bg-card rounded-xl border card-resting p-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56 mb-6" />
                <Skeleton className="h-[220px] w-full rounded-lg" />
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-card rounded-xl border card-resting p-5 space-y-3">
                <Skeleton className="h-5 w-40 mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
              <div className="bg-card rounded-xl border card-resting p-5 space-y-3">
                <Skeleton className="h-5 w-36 mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-xl border p-8 max-w-md text-center card-resting">
          <AlertCircle className="size-8 text-destructive mx-auto mb-3" />
          <p className="text-foreground mb-4">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your application progress and upcoming deadlines
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Viewing{" "}
              <span className="font-medium text-foreground">
                {selectedCycleName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportDeadlinesToIcs(allUpcomingDeadlines)}
              disabled={allUpcomingDeadlines.length === 0}
              aria-label="Export upcoming deadlines to calendar"
              title="Export upcoming deadlines as a calendar file (.ics)"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 disabled:opacity-50 rounded-lg transition-colors"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export Calendar</span>
            </button>
            {notificationPermission !== "unsupported" &&
              notificationPermission !== "denied" && (
                <button
                  onClick={async () => {
                    if (notificationPermission === "granted") return;
                    const result = await requestNotificationPermission();
                    setNotificationPermission(result);
                    if (result === "granted") {
                      toast.success("Deadline notifications enabled");
                    } else if (result === "denied") {
                      toast.error("Notifications were not enabled");
                    }
                  }}
                  aria-label={
                    notificationPermission === "granted"
                      ? "Deadline notifications are enabled"
                      : "Enable deadline notifications"
                  }
                  title={
                    notificationPermission === "granted"
                      ? "Deadline notifications are enabled"
                      : "Enable deadline notifications"
                  }
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    notificationPermission === "granted"
                      ? "text-foreground bg-secondary cursor-default"
                      : "text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {notificationPermission === "granted" ? (
                    <Bell className="size-4" aria-hidden="true" />
                  ) : (
                    <BellOff className="size-4" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {notificationPermission === "granted"
                      ? "Notifications On"
                      : "Enable Notifications"}
                  </span>
                </button>
              )}
            <button
              onClick={load}
              aria-label="Refresh dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Alert strip */}
        {(openingSoon.length > 0 || upcomingDeadlines.length > 0) && (
          <div className="space-y-2">
            {openingSoon.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/20 rounded-lg px-4 py-3 text-sm"
              >
                <AlertCircle
                  className="size-4 text-sky-600 dark:text-sky-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sky-700 dark:text-sky-300">
                  📅 <strong>{u.name}</strong> opens in{" "}
                  <strong>{getDaysUntil(u.startDate)} days</strong>
                </span>
              </div>
            ))}
            {upcomingDeadlines.map((d) => (
              <div
                key={`${d.type}-${d.id}`}
                className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3 text-sm"
              >
                <AlertCircle
                  className="size-4 text-orange-600 dark:text-orange-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-orange-700 dark:text-orange-300">
                  ⚠️ <strong>{d.name}</strong> (
                  {d.type === "scholarship" ? "scholarship" : "university"})
                  deadline in <strong>{getDaysUntil(d.deadline)} days</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {!cyclesLoading && cycles.length === 0 ? (
          <div className="bg-card rounded-xl border p-16 text-center card-resting">
            <GraduationCap className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">
              No application cycles yet
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create a cycle in Settings to start tracking applications.
            </p>
            <a
              href="/settings"
              className="inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition"
            >
              Go to Settings
            </a>
          </div>
        ) : universities.length === 0 ? (
          <div className="bg-card rounded-xl border p-16 text-center card-resting">
            <GraduationCap className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">
              No universities yet
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Head to the Universities page to start tracking your applications.
            </p>
            <a
              href="/universities"
              className="inline-flex px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition"
            >
              Add Universities
            </a>
          </div>
        ) : (
          <>
            {/* Per-cycle breakdown, All Cycles view only */}
            {cycleBreakdown.length > 1 && (
              <div className="bg-card rounded-xl border card-resting overflow-hidden mb-4 sm:mb-6">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-base font-semibold text-card-foreground">
                    Breakdown by Cycle
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                        <th className="text-left px-6 py-2.5 font-medium">
                          Cycle
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium">
                          Universities
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium">
                          Pending
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium">
                          Accepted
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium">
                          Rejected
                        </th>
                        <th className="text-right px-6 py-2.5 font-medium">
                          Scholarships
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycleBreakdown.map((row) => (
                        <tr
                          key={row.cycle.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-6 py-3 font-medium text-foreground">
                            <span className="inline-flex items-center gap-2">
                              {row.cycle.name}
                              {row.cycle.isActive && (
                                <span
                                  className="text-[10px] uppercase tracking-wide font-semibold"
                                  style={{
                                    color: "var(--status-accepted-strong)",
                                  }}
                                >
                                  Active
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="text-right px-4 py-3 text-foreground tabular-nums">
                            {row.total}
                          </td>
                          <td className="text-right px-4 py-3 text-muted-foreground tabular-nums">
                            {row.pending}
                          </td>
                          <td
                            className="text-right px-4 py-3 tabular-nums"
                            style={{ color: "var(--status-accepted-strong)" }}
                          >
                            {row.accepted}
                          </td>
                          <td className="text-right px-4 py-3 text-destructive tabular-nums">
                            {row.rejected}
                          </td>
                          <td className="text-right px-6 py-3 text-foreground tabular-nums">
                            {row.scholarshipCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
              <KPICard
                title="Total"
                delay={0}
                value={stats.total}
                icon={GraduationCap}
                color="text-foreground"
                bgColor="bg-muted"
              />
              <KPICard
                title="Not Yet Open"
                delay={0.05}
                value={stats.notYetOpen}
                icon={Clock}
                color="text-[var(--status-not-yet-open-text)]"
                bgColor="bg-[var(--status-not-yet-open-tint)]"
              />
              <KPICard
                title="Not Started"
                delay={0.1}
                value={stats.notStarted}
                icon={FileText}
                color="text-[var(--status-not-started-text)]"
                bgColor="bg-[var(--status-not-started-tint)]"
              />
              <KPICard
                title="In Progress"
                delay={0.15}
                value={stats.inProgress}
                icon={Loader2}
                color="text-[var(--status-in-progress-text)]"
                bgColor="bg-[var(--status-in-progress-tint)]"
              />
              <KPICard
                title="Submitted"
                delay={0.2}
                value={stats.submitted}
                icon={Send}
                color="text-[var(--status-submitted-text)]"
                bgColor="bg-[var(--status-submitted-tint)]"
              />
              <KPICard
                title="Accepted"
                delay={0.25}
                value={stats.accepted}
                icon={CheckCircle2}
                color="text-[var(--status-accepted-text)]"
                bgColor="bg-[var(--status-accepted-tint)]"
              />
              <KPICard
                title="Rejected"
                delay={0.3}
                value={stats.rejected}
                icon={XCircle}
                color="text-[var(--status-rejected-text)]"
                bgColor="bg-[var(--status-rejected-tint)]"
              />
              <KPICard
                title="Waitlisted"
                delay={0.35}
                value={stats.waitlisted}
                icon={Clock}
                color="text-[var(--status-waitlisted-text)]"
                bgColor="bg-[var(--status-waitlisted-tint)]"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {/* Charts */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-xl border card-resting p-6">
                  <h2 className="text-lg font-semibold text-card-foreground mb-2">
                    Application Status Distribution
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Breakdown of all your applications by current status
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={108}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          color: "var(--popover-foreground)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                        }}
                        itemStyle={{ color: "var(--popover-foreground)" }}
                        labelStyle={{ color: "var(--popover-foreground)" }}
                      />
                      <Legend />
                      {/* Centre label showing total */}
                      <text
                        x="50%"
                        y="46%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground"
                        style={{ fontSize: 26, fontWeight: 700 }}
                      >
                        {stats.total}
                      </text>
                      <text
                        x="50%"
                        y="54%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground"
                        style={{ fontSize: 12 }}
                      >
                        Total
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl border card-resting p-6">
                  <h2 className="text-lg font-semibold text-card-foreground mb-2">
                    Applications by Status
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Count of applications in each stage
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 5, right: 24, left: 16, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="status"
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          color: "var(--popover-foreground)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                        }}
                        itemStyle={{ color: "var(--popover-foreground)" }}
                        labelStyle={{ color: "var(--popover-foreground)" }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right panel */}
              <div className="space-y-5">
                {/* Upcoming Deadlines : universities + scholarships */}
                <div className="bg-card rounded-xl border card-resting p-5">
                  <h2 className="text-base font-semibold text-card-foreground mb-1 flex items-center gap-2">
                    <AlertCircle
                      className="size-4"
                      style={{ color: statusStrong["waitlisted"] }}
                      aria-hidden="true"
                    />
                    Upcoming Deadlines
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    In Progress, due within 15 days
                  </p>
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No applications in progress are due within the next 15
                      days.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {upcomingDeadlines.map((item) => {
                        const urgency = getDeadlineUrgency(item.deadline);
                        const colors = {
                          urgent: "border-l-destructive bg-destructive/5",
                          warning: "border-l-orange-400 bg-orange-500/10",
                          normal: "border-l-blue-400 bg-blue-500/10",
                        };
                        const days = getDaysUntil(item.deadline);
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            className={`border-l-4 ${colors[urgency]} p-3 rounded-r-lg`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.name}
                              </p>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${item.type === "scholarship" ? "bg-purple-500/15 text-purple-700 dark:text-purple-300" : "bg-blue-500/15 text-blue-700 dark:text-blue-300"}`}
                              >
                                {item.type === "scholarship"
                                  ? "Scholarship"
                                  : "University"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                              {days !== null && days >= 0
                                ? `${days} days : ${new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                : "Past deadline"}
                            </p>
                            <div className="mt-1">
                              <StatusBadge
                                status={item.status}
                                size="sm"
                                showIcon
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upcoming Applications : universities not yet open */}
                <div className="bg-card rounded-xl border card-resting p-5">
                  <h2 className="text-base font-semibold text-card-foreground mb-1 flex items-center gap-2">
                    <CalendarClock
                      className="size-4"
                      style={{ color: statusStrong["not-yet-open"] }}
                      aria-hidden="true"
                    />
                    Upcoming Applications
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Universities not yet open for applications
                  </p>
                  {upcomingApplications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No upcoming applications. Everything is open or in
                      progress.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {upcomingApplications.map((u) => {
                        const days = getDaysUntil(u.startDate);
                        return (
                          <div
                            key={u.id}
                            className="border-l-4 p-3 rounded-r-lg"
                            style={{
                              borderColor: statusStrong["not-yet-open"],
                              backgroundColor:
                                "var(--status-not-yet-open-tint)",
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {u.name}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {u.region}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                              {u.startDate
                                ? days !== null && days >= 0
                                  ? `Opens in ${days} days : ${new Date(
                                      u.startDate,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}`
                                  : "Opening date passed"
                                : "Opening date not yet set"}
                            </p>
                            <div className="mt-1">
                              <StatusBadge
                                status="not-yet-open"
                                size="sm"
                                showIcon
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Scholarship Summary */}
                <div className="bg-card rounded-xl border card-resting p-5">
                  <h2 className="text-base font-semibold text-card-foreground mb-1 flex items-center gap-2">
                    <TrendingUp
                      className="size-4 text-brand-600"
                      aria-hidden="true"
                    />
                    Scholarship Summary
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Funding secured, potential, and status
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Scholarships
                      </span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {scholarships.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Submitted
                      </span>
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: statusStrong["submitted"] }}
                      >
                        {
                          scholarships.filter((s) => s.status === "submitted")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Awarded
                      </span>
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: statusStrong["awarded"] }}
                      >
                        {
                          scholarships.filter((s) => s.status === "awarded")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <span className="text-sm font-medium text-foreground">
                        Funding Secured
                      </span>
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: statusStrong["awarded"] }}
                      >
                        GHS{" "}
                        {totalSecuredGHS.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        Total Potential Funding
                      </span>
                      <span className="text-sm font-semibold text-brand-600 tabular-nums">
                        GHS{" "}
                        {totalFundingGHS.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      * GHS amounts are approximate. Exchange rates may vary.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
