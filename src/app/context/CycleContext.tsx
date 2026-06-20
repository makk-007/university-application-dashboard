import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { ApplicationCycle } from "../types";
import {
  getCycles,
  createCycle as createCycleService,
  updateCycle as updateCycleService,
  archiveCycle as archiveCycleService,
  setActiveCycle as setActiveCycleService,
} from "../../services/cycles";

interface CycleContextType {
  cycles: ApplicationCycle[];
  activeCycleId: string | null;
  selectedCycleId: string | null;
  loading: boolean;
  error: string | null;
  // selectedCycleId is what the dashboard/list pages currently display.
  // Passing null selects "All Cycles".
  selectCycle: (id: string | null) => void;
  setActiveCycle: (id: string) => Promise<void>;
  createCycle: (
    data: Omit<ApplicationCycle, "id" | "createdAt">,
  ) => Promise<ApplicationCycle>;
  updateCycle: (
    id: string,
    data: Partial<Omit<ApplicationCycle, "id" | "createdAt">>,
  ) => Promise<void>;
  archiveCycle: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | null>(null);

const SELECTED_CYCLE_STORAGE_KEY = "uat:selectedCycleId";

export function CycleProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cycles, setCycles] = useState<ApplicationCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(
    () => localStorage.getItem(SELECTED_CYCLE_STORAGE_KEY) || null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCycleId = cycles.find((c) => c.isActive)?.id ?? null;

  const refresh = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setCycles([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getCycles();
      setCycles(data);

      // If nothing is selected yet, or the previously selected cycle no
      // longer exists, default to the active cycle.
      setSelectedCycleId((prev) => {
        if (prev && data.some((c) => c.id === prev)) return prev;
        return data.find((c) => c.isActive)?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cycles");
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Persist the viewing selection across reloads
  useEffect(() => {
    if (selectedCycleId) {
      localStorage.setItem(SELECTED_CYCLE_STORAGE_KEY, selectedCycleId);
    } else {
      localStorage.removeItem(SELECTED_CYCLE_STORAGE_KEY);
    }
  }, [selectedCycleId]);

  const selectCycle = (id: string | null) => {
    setSelectedCycleId(id);
  };

  const setActiveCycle = async (id: string) => {
    await setActiveCycleService(id, true);
    await refresh();
  };

  const createCycle = async (
    data: Omit<ApplicationCycle, "id" | "createdAt">,
  ) => {
    const created = await createCycleService(data);
    await refresh();
    return created;
  };

  const updateCycle = async (
    id: string,
    data: Partial<Omit<ApplicationCycle, "id" | "createdAt">>,
  ) => {
    await updateCycleService(id, data);
    await refresh();
  };

  const archiveCycle = async (id: string) => {
    await archiveCycleService(id);
    await refresh();
  };

  return (
    <CycleContext.Provider
      value={{
        cycles,
        activeCycleId,
        selectedCycleId,
        loading,
        error,
        selectCycle,
        setActiveCycle,
        createCycle,
        updateCycle,
        archiveCycle,
        refresh,
      }}
    >
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error("useCycle must be used within CycleProvider");
  return ctx;
}
