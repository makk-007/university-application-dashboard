import type { ApplicationStatus } from "../types";
import { statusConfig, statusStrong } from "../utils/statusConfig";

interface StatusSelectorProps {
  label: string;
  statuses: ApplicationStatus[];
  current: ApplicationStatus;
  disabled?: boolean;
  onSelect: (status: ApplicationStatus) => void;
}

/** Labelled row of status buttons; the current status is highlighted. */
export function StatusSelector({
  label,
  statuses,
  current,
  disabled,
  onSelect,
}: StatusSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const config = statusConfig[status];
          const isSelected = current === status;
          return (
            <button
              key={status}
              onClick={() => onSelect(status)}
              disabled={disabled}
              style={
                isSelected ? { borderColor: statusStrong[status] } : undefined
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${isSelected ? `${config.color} ${config.bgColor}` : "bg-muted text-muted-foreground border-transparent hover:border-border"}`}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
