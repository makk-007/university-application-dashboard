import { CalendarRange, ChevronDown, Check, Layers } from "lucide-react";
import { useCycle } from "../context/CycleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface CycleSelectorProps {
  /** Compact icon-only trigger for tight spaces like the mobile top bar. */
  compact?: boolean;
}

export function CycleSelector({ compact = false }: CycleSelectorProps) {
  const { cycles, selectedCycleId, loading, selectCycle } = useCycle();

  if (loading) {
    return (
      <div
        className={
          compact
            ? "h-8 w-8 rounded-lg bg-sidebar-accent/50 animate-pulse"
            : "h-10 rounded-lg bg-sidebar-accent/50 animate-pulse"
        }
      />
    );
  }

  if (cycles.length === 0) {
    return null;
  }

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) ?? null;
  const label = selectedCycle ? selectedCycle.name : "All Cycles";

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={`Current cycle: ${label}`}
            title={label}
            className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <CalendarRange className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <CycleMenuItems
            cycles={cycles}
            selectedCycleId={selectedCycleId}
            onSelect={selectCycle}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-sidebar-border bg-card text-sidebar-foreground hover:border-sidebar-primary/40 hover:bg-sidebar-accent/50 transition-colors card-resting">
          <CalendarRange
            className="size-4 shrink-0 text-sidebar-primary"
            aria-hidden="true"
          />
          <span className="flex-1 text-left text-sm font-medium truncate">
            {label}
          </span>
          <ChevronDown
            className="size-3.5 shrink-0 opacity-60"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <CycleMenuItems
          cycles={cycles}
          selectedCycleId={selectedCycleId}
          onSelect={selectCycle}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CycleMenuItems({
  cycles,
  selectedCycleId,
  onSelect,
}: {
  cycles: ReturnType<typeof useCycle>["cycles"];
  selectedCycleId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <>
      <DropdownMenuLabel>Viewing Cycle</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {cycles.map((cycle) => (
        <DropdownMenuItem
          key={cycle.id}
          onClick={() => onSelect(cycle.id)}
          className="flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="truncate">{cycle.name}</span>
            {cycle.isActive && (
              <span
                className="text-[10px] uppercase tracking-wide font-semibold shrink-0"
                style={{ color: "var(--status-accepted-strong)" }}
              >
                Active
              </span>
            )}
          </span>
          {selectedCycleId === cycle.id && (
            <Check
              className="size-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
          )}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onSelect(null)}
        className="flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2">
          <Layers className="size-3.5 shrink-0" aria-hidden="true" />
          All Cycles
        </span>
        {selectedCycleId === null && (
          <Check
            className="size-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
        )}
      </DropdownMenuItem>
    </>
  );
}
