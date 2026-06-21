import { ApplicationStatus } from "../types";
import {
  Clock,
  Circle,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Hourglass,
  Trophy,
  Ban,
  LucideIcon,
} from "lucide-react";

export const statusConfig: Record<
  ApplicationStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: LucideIcon;
  }
> = {
  "not-yet-open": {
    label: "Not Yet Open",
    color: "text-[var(--status-not-yet-open-text)]",
    bgColor: "bg-[var(--status-not-yet-open-tint)]",
    borderColor: "border-transparent",
    icon: Clock,
  },
  "not-started": {
    label: "Not Started",
    color: "text-[var(--status-not-started-text)]",
    bgColor: "bg-[var(--status-not-started-tint)]",
    borderColor: "border-transparent",
    icon: Circle,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-[var(--status-in-progress-text)]",
    bgColor: "bg-[var(--status-in-progress-tint)]",
    borderColor: "border-transparent",
    icon: Play,
  },
  submitted: {
    label: "Submitted",
    color: "text-[var(--status-submitted-text)]",
    bgColor: "bg-[var(--status-submitted-tint)]",
    borderColor: "border-transparent",
    icon: Send,
  },
  accepted: {
    label: "Accepted",
    color: "text-[var(--status-accepted-text)]",
    bgColor: "bg-[var(--status-accepted-tint)]",
    borderColor: "border-transparent",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-[var(--status-rejected-text)]",
    bgColor: "bg-[var(--status-rejected-tint)]",
    borderColor: "border-transparent",
    icon: XCircle,
  },
  waitlisted: {
    label: "Waitlisted",
    color: "text-[var(--status-waitlisted-text)]",
    bgColor: "bg-[var(--status-waitlisted-tint)]",
    borderColor: "border-transparent",
    icon: Hourglass,
  },
  awarded: {
    label: "Awarded",
    color: "text-[var(--status-awarded-text)]",
    bgColor: "bg-[var(--status-awarded-tint)]",
    borderColor: "border-transparent",
    icon: Trophy,
  },
  withdrawn: {
    label: "Withdrawn",
    color: "text-[var(--status-withdrawn-text)]",
    bgColor: "bg-[var(--status-withdrawn-tint)]",
    borderColor: "border-transparent",
    icon: Ban,
  },
};

/** Strong/icon shade per status : used for KPI icon tints and chart fills,
 *  so the whole app draws from one status color language. */
export const statusStrong: Record<ApplicationStatus, string> = {
  "not-yet-open": "var(--status-not-yet-open-strong)",
  "not-started": "var(--status-not-started-strong)",
  "in-progress": "var(--status-in-progress-strong)",
  submitted: "var(--status-submitted-strong)",
  accepted: "var(--status-accepted-strong)",
  rejected: "var(--status-rejected-strong)",
  waitlisted: "var(--status-waitlisted-strong)",
  awarded: "var(--status-awarded-strong)",
  withdrawn: "var(--status-withdrawn-strong)",
};

export const ALL_STATUSES: ApplicationStatus[] = [
  "not-yet-open",
  "not-started",
  "in-progress",
  "submitted",
  "accepted",
  "rejected",
  "waitlisted",
  "awarded",
  "withdrawn",
];

/** Statuses applicable to university applications (excludes 'awarded', which is scholarship-only). */
export const UNI_STATUSES: ApplicationStatus[] = [
  "not-yet-open",
  "not-started",
  "in-progress",
  "submitted",
  "accepted",
  "rejected",
  "waitlisted",
  "withdrawn",
];

export const getDeadlineUrgency = (
  deadline: string | null,
): "urgent" | "warning" | "normal" => {
  if (!deadline) return "normal";
  const days = Math.floor(
    (new Date(deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (days < 14) return "urgent";
  if (days < 30) return "warning";
  return "normal";
};

export const getDaysUntil = (date: string | null): number | null => {
  if (!date) return null;
  return Math.floor(
    (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
};
