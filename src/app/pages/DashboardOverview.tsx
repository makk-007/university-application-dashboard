import { useState, useEffect, useMemo } from "react";
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
  getDeadlineUrgency,
  getDaysUntil,
} from "../utils/statusConfig";
import { getUniversities } from "../../services/universities";
import { getScholarships } from "../../services/scholarships";
import { University, Scholarship, FX_TO_GHS } from "../types";

export function DashboardOverview() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
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
      toast.error("Failed to load dashboard", { description: e.message });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

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

  const pieData = [
    { name: "Not Yet Open", value: stats.notYetOpen, color: "#0EA5E9" },
    { name: "Not Started", value: stats.notStarted, color: "#9CA3AF" },
    { name: "In Progress", value: stats.inProgress, color: "#3B82F6" },
    { name: "Submitted", value: stats.submitted, color: "#A855F7" },
    { name: "Accepted", value: stats.accepted, color: "#10B981" },
    { name: "Rejected", value: stats.rejected, color: "#EF4444" },
    { name: "Waitlisted", value: stats.waitlisted, color: "#F59E0B" },
  ].filter((d) => d.value > 0);

  const barData = [
    { status: "Not Open", count: stats.notYetOpen, fill: "#0EA5E9" },
    { status: "Not Started", count: stats.notStarted, fill: "#9CA3AF" },
    { status: "In Progress", count: stats.inProgress, fill: "#3B82F6" },
    { status: "Submitted", count: stats.submitted, fill: "#A855F7" },
    { status: "Accepted", count: stats.accepted, fill: "#10B981" },
    { status: "Rejected", count: stats.rejected, fill: "#EF4444" },
    { status: "Waitlisted", count: stats.waitlisted, fill: "#F59E0B" },
  ].filter((d) => d.count > 0);

  // ── Upcoming deadlines : universities + scholarships (user's addition) ──────
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const uniDeadlines = universities
      .filter(
        (u) =>
          u.deadline &&
          new Date(u.deadline) > today &&
          u.status !== "accepted" &&
          u.status !== "rejected",
      )
      .map((u) => ({
        id: u.id,
        name: u.name,
        deadline: u.deadline!,
        status: u.status,
        type: "university" as const,
      }));
    const scholDeadlines = scholarships
      .filter(
        (s) =>
          s.deadline &&
          new Date(s.deadline) > today &&
          s.status !== "awarded" &&
          s.status !== "rejected",
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        deadline: s.deadline!,
        status: s.status,
        type: "scholarship" as const,
      }));
    return [...uniDeadlines, ...scholDeadlines]
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      )
      .slice(0, 8);
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
          new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime(),
      )
      .slice(0, 3);
  }, [universities]);

  const totalFundingGHS = useMemo(
    () =>
      scholarships.reduce(
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
                className="bg-card rounded-xl border p-5 shadow-sm space-y-3"
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
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <Skeleton className="h-[280px] w-full rounded-lg" />
              </div>
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56 mb-6" />
                <Skeleton className="h-[220px] w-full rounded-lg" />
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
                <Skeleton className="h-5 w-40 mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
              <div className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
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
        <div className="bg-card rounded-xl border p-8 max-w-md text-center shadow-sm">
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
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            <RefreshCw className="size-4" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Alert strip */}
        {(openingSoon.length > 0 ||
          upcomingDeadlines.some(
            (d) => (getDaysUntil(d.deadline) ?? 999) <= 15,
          )) && (
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
            {upcomingDeadlines
              .filter((d) => (getDaysUntil(d.deadline) ?? 999) <= 15)
              .map((d) => (
                <div
                  key={d.id}
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

        {universities.length === 0 ? (
          <div className="bg-card rounded-xl border p-16 text-center shadow-sm">
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
                color="text-sky-600"
                bgColor="bg-sky-500/10"
              />
              <KPICard
                title="Not Started"
                delay={0.1}
                value={stats.notStarted}
                icon={FileText}
                color="text-muted-foreground"
                bgColor="bg-muted"
              />
              <KPICard
                title="In Progress"
                delay={0.15}
                value={stats.inProgress}
                icon={Loader2}
                color="text-blue-600"
                bgColor="bg-blue-500/10"
              />
              <KPICard
                title="Submitted"
                delay={0.2}
                value={stats.submitted}
                icon={Send}
                color="text-purple-600"
                bgColor="bg-purple-500/10"
              />
              <KPICard
                title="Accepted"
                delay={0.25}
                value={stats.accepted}
                icon={CheckCircle2}
                color="text-green-600"
                bgColor="bg-green-500/10"
              />
              <KPICard
                title="Rejected"
                delay={0.3}
                value={stats.rejected}
                icon={XCircle}
                color="text-destructive"
                bgColor="bg-destructive/10"
              />
              <KPICard
                title="Waitlisted"
                delay={0.35}
                value={stats.waitlisted}
                icon={Clock}
                color="text-orange-600"
                bgColor="bg-orange-500/10"
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
                <div className="bg-card rounded-xl border shadow-sm p-6">
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
                      <Tooltip formatter={(value, name) => [value, name]} />
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

                <div className="bg-card rounded-xl border shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-card-foreground mb-2">
                    Applications by Status
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Count of applications in each stage
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={barData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="status"
                        tick={{ fontSize: 11 }}
                        angle={-30}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
                <div className="bg-card rounded-xl border shadow-sm p-5">
                  <h2 className="text-base font-semibold text-card-foreground mb-1 flex items-center gap-2">
                    <AlertCircle className="size-4 text-orange-500" />
                    Upcoming Deadlines
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Universities and scholarships
                  </p>
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No upcoming deadlines
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
                            <p className="text-xs text-muted-foreground mt-0.5">
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

                {/* Scholarship Summary */}
                <div className="bg-card rounded-xl border shadow-sm p-5">
                  <h2 className="text-base font-semibold text-card-foreground mb-1 flex items-center gap-2">
                    <TrendingUp className="size-4 text-blue-500" />
                    Scholarship Summary
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Funding potential and status
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Scholarships
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {scholarships.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Submitted
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
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
                      <span className="text-sm font-semibold text-emerald-600">
                        {
                          scholarships.filter((s) => s.status === "awarded")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <span className="text-sm font-medium text-foreground">
                        Total Potential Funding
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
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
