import { ApplicationStatus } from "../types";
import { statusConfig } from "../utils/statusConfig";

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showIcon = false,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs";
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium whitespace-nowrap
        ${sizeClass}
        ${config.color} ${config.bgColor} ${config.borderColor}`}
    >
      {showIcon && <Icon className="size-3 shrink-0" aria-hidden="true" />}
      {config.label}
    </span>
  );
}
