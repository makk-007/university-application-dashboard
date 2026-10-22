/**
 * In-memory stand-in for the Supabase client, used by the service tests.
 *
 * Every query chain (`from(...).insert(...).select()...`) is recorded in
 * `log`, and resolves to a canned response. Tests inject failures through
 * `config.fail` to exercise the rollback and restore paths. This checks the
 * call sequences the services make, not real PostgREST behavior.
 */

export type Op = [method: string, args: unknown[]];
export interface LoggedCall {
  table: string;
  ops: Op[];
}

export const log: LoggedCall[] = [];

export const config: {
  fail: (table: string, ops: Op[]) => boolean;
  activeCycleId: string | null;
  existingLinks: string[];
} = { fail: () => false, activeCycleId: "c_old", existingLinks: [] };

export function resetFake(): void {
  log.length = 0;
  config.fail = () => false;
  config.activeCycleId = "c_old";
  config.existingLinks = [];
}

const baseRow = {
  id: "x_new",
  user_id: "user-1",
  cycle_id: null,
  name: "N",
  region: "R",
  status: "not-started",
  tuition: 0,
  currency: "GHS",
  start_date: null,
  deadline: null,
  application_link: "",
  notes: "",
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  amount: 0,
  coverage: "Full Scholarship",
  link: "",
};

function run(table: string, ops: Op[]) {
  log.push({ table, ops: ops.map((o) => [o[0], o[1]] as Op) });
  if (config.fail(table, ops)) {
    return { data: null, error: { code: "XX000", message: "injected" } };
  }
  const first = ops[0][0];
  const isSingle = ops.some((o) => o[0] === "single");
  const isMaybe = ops.some((o) => o[0] === "maybeSingle");

  if (table === "universities" && (first === "insert" || first === "select")) {
    return { data: isSingle ? { ...baseRow, id: "u_new" } : [], error: null };
  }
  if (table === "scholarships" && (first === "insert" || first === "select")) {
    return { data: isSingle ? { ...baseRow, id: "s_new" } : [], error: null };
  }
  if (table === "scholarship_universities" && first === "select") {
    return {
      data: config.existingLinks.map((u) => ({
        university_id: u,
        scholarship_id: "s1",
      })),
      error: null,
    };
  }
  if (table === "application_cycles" && first === "select" && isMaybe) {
    return {
      data: config.activeCycleId ? { id: config.activeCycleId } : null,
      error: null,
    };
  }
  if (first === "select") {
    return { data: isSingle ? baseRow : [], error: null };
  }
  if (first === "insert" && isSingle) {
    return {
      data: { ...baseRow, id: "c_new", is_active: true, is_archived: false },
      error: null,
    };
  }
  return { data: null, error: null };
}

function builder(table: string): unknown {
  const ops: Op[] = [];
  const proxy: unknown = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === "then") {
          return (
            resolve: (value: unknown) => unknown,
            reject: (reason: unknown) => unknown,
          ) => Promise.resolve(run(table, ops)).then(resolve, reject);
        }
        return (...args: unknown[]) => {
          ops.push([prop, args]);
          return proxy;
        };
      },
    },
  );
  return proxy;
}

export const supabase = {
  from: (table: string) => builder(table),
  auth: {
    getSession: async () => ({
      data: { session: { user: { id: "user-1" } } },
    }),
  },
};
