import { beforeEach, describe, expect, it, vi } from "vitest";
import { config, log, resetFake, type LoggedCall } from "../test/fakeSupabase";
import { DEFAULT_CHECKLIST_ITEMS } from "../app/types";
import { createCycle, setActiveCycle } from "./cycles";
import {
  createScholarship,
  setScholarshipUniversities,
} from "./scholarships";
import { createUniversity, duplicateUniversity } from "./universities";

// Swap the real Supabase client for the in-memory fake, which records every
// query and can be told to fail specific calls.
vi.mock("../app/lib/supabase", async () => await import("../test/fakeSupabase"));

const uniData = {
  cycleId: null,
  name: "N",
  region: "R",
  status: "not-started" as const,
  tuition: 0,
  currency: "GHS",
  startDate: null,
  deadline: null,
  applicationLink: "",
  notes: "",
};

const scholData = {
  cycleId: null,
  name: "S",
  status: "not-started" as const,
  amount: 0,
  currency: "GHS",
  coverage: "Full Scholarship" as const,
  notes: "",
  link: "",
  startDate: null,
  deadline: null,
  eligibleUniversities: [] as string[],
};

const cycleData = (isActive: boolean) => ({
  name: "C",
  description: "",
  startDate: null,
  endDate: null,
  isActive,
});

const calls = (table: string, op: string): LoggedCall[] =>
  log.filter((l) => l.table === table && l.ops[0][0] === op);
const firstArg = (call: LoggedCall) => call.ops[0][1][0];
const rowsOf = (call: LoggedCall) =>
  firstArg(call) as Record<string, unknown>[];
const eqArgs = (call: LoggedCall) => call.ops.find((o) => o[0] === "eq")?.[1];
const failOn = (table: string, op: string) => (t: string, ops: [string, unknown[]][]) =>
  t === table && ops[0][0] === op;

/** [is_active value, cycle id] for every update to application_cycles. */
const cycleUpdates = () =>
  calls("application_cycles", "update").map((c) => [
    (firstArg(c) as { is_active: boolean }).is_active,
    eqArgs(c)?.[1],
  ]);

beforeEach(resetFake);

describe("createUniversity", () => {
  it("seeds the default checklist once, with no deletes", async () => {
    await createUniversity(uniData);
    const inserts = calls("checklist", "insert");
    expect(inserts).toHaveLength(1);
    expect(rowsOf(inserts[0])).toHaveLength(DEFAULT_CHECKLIST_ITEMS.length);
    expect(calls("checklist", "delete")).toHaveLength(0);
  });

  it("inserts exactly the supplied items, in order", async () => {
    await createUniversity(uniData, ["a", "b"]);
    const rows = rowsOf(calls("checklist", "insert")[0]);
    expect(rows.map((r) => [r.item, r.sort_order])).toEqual([
      ["a", 0],
      ["b", 1],
    ]);
  });

  it("inserts no checklist when given an empty list", async () => {
    await createUniversity(uniData, []);
    expect(calls("checklist", "insert")).toHaveLength(0);
  });

  it("removes the new university when the checklist insert fails", async () => {
    config.fail = failOn("checklist", "insert");
    await expect(createUniversity(uniData)).rejects.toThrow();
    const deletes = calls("universities", "delete");
    expect(deletes).toHaveLength(1);
    expect(eqArgs(deletes[0])).toEqual(["id", "u_new"]);
  });
});

describe("duplicateUniversity", () => {
  it("copies the source checklist in one insert, never seeding defaults", async () => {
    await duplicateUniversity("u_src", null);
    expect(calls("checklist", "delete")).toHaveLength(0);
    // The source has an empty checklist, so the copy must be empty too
    // rather than falling back to the default template.
    expect(calls("checklist", "insert")).toHaveLength(0);
  });
});

describe("createScholarship", () => {
  it("removes the scholarship when linking universities fails", async () => {
    config.fail = failOn("scholarship_universities", "insert");
    await expect(
      createScholarship({ ...scholData, eligibleUniversities: ["u1"] }),
    ).rejects.toThrow();
    expect(calls("scholarships", "delete")).toHaveLength(1);
  });

  it("removes the scholarship when the checklist insert fails", async () => {
    config.fail = failOn("scholarship_checklist", "insert");
    await expect(createScholarship(scholData)).rejects.toThrow();
    const deletes = calls("scholarships", "delete");
    expect(deletes).toHaveLength(1);
    expect(eqArgs(deletes[0])).toEqual(["id", "s_new"]);
  });

  it("keeps the scholarship and inserts the supplied items on success", async () => {
    await createScholarship(scholData, ["x"]);
    expect(calls("scholarships", "delete")).toHaveLength(0);
    expect(rowsOf(calls("scholarship_checklist", "insert")[0])).toHaveLength(1);
  });
});

describe("setScholarshipUniversities", () => {
  it("adds missing links before removing stale ones", async () => {
    config.existingLinks = ["A", "B"];
    await setScholarshipUniversities("s1", ["B", "C"]);

    const order = log
      .filter((l) => l.table === "scholarship_universities")
      .map((l) => l.ops[0][0]);
    expect(order).toEqual(["select", "insert", "delete"]);

    const added = rowsOf(calls("scholarship_universities", "insert")[0]).map(
      (r) => r.university_id,
    );
    expect(added).toEqual(["C"]);
    const removeCall = calls("scholarship_universities", "delete")[0];
    expect(removeCall.ops.find((o) => o[0] === "in")?.[1][1]).toEqual(["A"]);
  });

  it("never deletes anything when the insert fails", async () => {
    config.existingLinks = ["A"];
    config.fail = failOn("scholarship_universities", "insert");
    await expect(setScholarshipUniversities("s1", ["B"])).rejects.toThrow();
    expect(calls("scholarship_universities", "delete")).toHaveLength(0);
  });

  it("writes nothing when the links already match", async () => {
    config.existingLinks = ["A"];
    await setScholarshipUniversities("s1", ["A"]);
    expect(calls("scholarship_universities", "insert")).toHaveLength(0);
    expect(calls("scholarship_universities", "delete")).toHaveLength(0);
  });
});

describe("setActiveCycle", () => {
  it("deactivates the old cycle then activates the new one", async () => {
    await setActiveCycle("c_new");
    expect(cycleUpdates()).toEqual([
      [false, "c_old"],
      [true, "c_new"],
    ]);
  });

  it("restores the previous cycle when activation fails", async () => {
    config.fail = (table, ops) =>
      table === "application_cycles" &&
      ops[0][0] === "update" &&
      (ops[0][1][0] as { is_active: boolean }).is_active === true &&
      ops.some((o) => o[0] === "eq" && o[1][1] === "c_new");
    await expect(setActiveCycle("c_new")).rejects.toThrow();
    expect(cycleUpdates()).toEqual([
      [false, "c_old"],
      [true, "c_new"],
      [true, "c_old"],
    ]);
  });

  it("just activates when no cycle is currently active", async () => {
    config.activeCycleId = null;
    await setActiveCycle("c_new");
    expect(cycleUpdates()).toEqual([[true, "c_new"]]);
  });

  it("leaves the active cycle alone when deactivating", async () => {
    await setActiveCycle("c_x", false);
    expect(cycleUpdates()).toEqual([[false, "c_x"]]);
  });
});

describe("createCycle", () => {
  it("restores the previous active cycle when the insert fails", async () => {
    config.fail = failOn("application_cycles", "insert");
    await expect(createCycle(cycleData(true))).rejects.toThrow();
    expect(cycleUpdates()).toEqual([
      [false, "c_old"],
      [true, "c_old"],
    ]);
  });

  it("does not touch other cycles when created inactive", async () => {
    await createCycle(cycleData(false));
    expect(calls("application_cycles", "update")).toHaveLength(0);
  });
});
