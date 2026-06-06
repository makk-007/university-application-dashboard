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
    color: "text-sky-700",
    bgColor: "bg-sky-100",
    borderColor: "border-sky-300",
    icon: Clock,
  },
  "not-started": {
    label: "Not Started",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    icon: Circle,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    icon: Play,
  },
  submitted: {
    label: "Submitted",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    icon: Send,
  },
  accepted: {
    label: "Accepted",
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    icon: XCircle,
  },
  waitlisted: {
    label: "Waitlisted",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    icon: Hourglass,
  },
  awarded: {
    label: "Awarded",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-300",
    icon: Trophy,
  },
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
