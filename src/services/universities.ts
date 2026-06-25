import { supabase } from "../app/lib/supabase";
import {
  University,
  ChecklistItem,
  ApplicationStatus,
  DEFAULT_CHECKLIST_ITEMS,
  BulkDeleteResult,
} from "../app/types";
import { parseSupabaseError, ConflictError } from "./errors";

// ── Mappers ──────────────────────────────────────────────────────────────────

function rowToUniversity(
  row: any,
  checklist: ChecklistItem[] = [],
  scholarships: any[] = [],
): University {
  return {
    id: row.id,
    cycleId: row.cycle_id ?? null,
    name: row.name,
    region: row.region,
    status: row.status as ApplicationStatus,
    tuition: row.tuition ?? 0,
    currency: row.currency ?? "USD",
    startDate: row.start_date ?? null,
    deadline: row.deadline ?? null,
    applicationLink: row.application_link ?? "",
    notes: row.notes ?? "",
    updatedAt: row.updated_at ?? null,
    checklist,
    scholarships,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getUniversities(cycleId?: string): Promise<University[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase.from("universities").select("*").eq("user_id", user.id);

  if (cycleId) query = query.eq("cycle_id", cycleId);

  const { data: unis, error } = await query.order("created_at", {
    ascending: true,
  });

  if (error) throw new Error(parseSupabaseError(error));
  if (!unis || unis.length === 0) return [];

  const uniIds = unis.map((u) => u.id);

  // Fetch all checklist items for all universities in one query
  const { data: checklistRows } = await supabase
    .from("checklist")
    .select("*")
    .in("university_id", uniIds)
    .order("created_at", { ascending: true });

  // Fetch scholarship links
  const { data: linkRows } = await supabase
    .from("scholarship_universities")
    .select("university_id, scholarships(id, name, status, amount, currency)")
    .in("university_id", uniIds);

  const checklistMap: Record<string, ChecklistItem[]> = {};
  const scholarshipMap: Record<string, any[]> = {};

  (checklistRows ?? []).forEach((row) => {
    if (!checklistMap[row.university_id]) checklistMap[row.university_id] = [];
    checklistMap[row.university_id].push({
      id: row.id,
      universityId: row.university_id,
      item: row.item,
      completed: row.completed,
    });
  });

  (linkRows ?? []).forEach((row: any) => {
    if (!scholarshipMap[row.university_id])
      scholarshipMap[row.university_id] = [];
    if (row.scholarships)
      scholarshipMap[row.university_id].push(row.scholarships);
  });

  return unis.map((u) =>
    rowToUniversity(u, checklistMap[u.id] ?? [], scholarshipMap[u.id] ?? []),
  );
}

export async function getUniversity(id: string): Promise<University> {
  const { data: uni, error } = await supabase
    .from("universities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(parseSupabaseError(error));

  const { data: checklistRows } = await supabase
    .from("checklist")
    .select("*")
    .eq("university_id", id)
    .order("created_at", { ascending: true });

  const checklist: ChecklistItem[] = (checklistRows ?? []).map((row) => ({
    id: row.id,
    universityId: row.university_id,
    item: row.item,
    completed: row.completed,
  }));

  return rowToUniversity(uni, checklist);
}

export async function createUniversity(
  data: Omit<University, "id" | "checklist" | "scholarships">,
): Promise<University> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: uni, error } = await supabase
    .from("universities")
    .insert({
      user_id: user.id,
      cycle_id: data.cycleId ?? null,
      name: data.name,
      region: data.region,
      status: data.status,
      tuition: data.tuition,
      currency: data.currency,
      start_date: data.startDate,
      deadline: data.deadline,
      application_link: data.applicationLink ?? "",
      notes: data.notes ?? "",
    })
    .select()
    .single();

  if (error) throw new Error(parseSupabaseError(error));

  // Add default checklist items
  if (DEFAULT_CHECKLIST_ITEMS.length > 0) {
    await supabase.from("checklist").insert(
      DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        university_id: uni.id,
        item,
        completed: false,
      })),
    );
  }

  return getUniversity(uni.id);
}

/**
 * Update a university. If expectedUpdatedAt is provided, the update only
 * applies if the row's updated_at still matches what the caller last
 * read; if another tab or session changed the row in the meantime,
 * updated_at will have moved on and zero rows will match, at which point
 * a ConflictError is thrown instead of silently overwriting the other
 * change. Callers that don't pass expectedUpdatedAt get the previous,
 * unconditional behavior.
 */
export async function updateUniversity(
  id: string,
  data: Partial<Omit<University, "id" | "checklist" | "scholarships">>,
  expectedUpdatedAt?: string | null,
): Promise<string | null> {
  const updateData: Record<string, any> = {};
  if (data.cycleId !== undefined) updateData.cycle_id = data.cycleId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.region !== undefined) updateData.region = data.region;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.tuition !== undefined) updateData.tuition = data.tuition;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;
  if (data.applicationLink !== undefined)
    updateData.application_link = data.applicationLink;
  if (data.notes !== undefined) updateData.notes = data.notes;

  let query = supabase.from("universities").update(updateData).eq("id", id);
  if (expectedUpdatedAt) {
    query = query.eq("updated_at", expectedUpdatedAt);
  }

  const { data: updatedRows, error } = await query.select("id, updated_at");

  if (error) throw new Error(parseSupabaseError(error));
  if (expectedUpdatedAt && (!updatedRows || updatedRows.length === 0)) {
    throw new ConflictError();
  }
  return updatedRows?.[0]?.updated_at ?? null;
}

export async function deleteUniversity(id: string): Promise<void> {
  const { error } = await supabase.from("universities").delete().eq("id", id);
  if (error) throw new Error(parseSupabaseError(error));
}

/**
 * Delete many universities in a single request when possible. A single
 * `DELETE ... WHERE id IN (...)` is one atomic statement: if it fails, no
 * rows in that call were deleted, so a true partial failure cannot occur
 * from the bulk call itself. If the bulk call fails (for example, an RLS
 * or constraint issue affecting a specific row), fall back to deleting
 * each row individually so the rows that are deletable still get deleted,
 * and the ones that aren't are reported back by id.
 */
export async function deleteUniversities(
  ids: string[],
): Promise<BulkDeleteResult> {
  if (ids.length === 0) return { succeededIds: [], failures: [] };

  const { error } = await supabase.from("universities").delete().in("id", ids);

  if (!error) {
    return { succeededIds: ids, failures: [] };
  }

  // Bulk call failed; fall back to per-row deletes to isolate which
  // specific records are the problem rather than failing the whole batch.
  const succeededIds: string[] = [];
  const failures: BulkDeleteResult["failures"] = [];
  for (const id of ids) {
    try {
      await deleteUniversity(id);
      succeededIds.push(id);
    } catch (e: any) {
      failures.push({ id, message: e.message });
    }
  }
  return { succeededIds, failures };
}

/**
 * Create universities from parsed CSV import rows. Each row becomes a new,
 * independent record (this never updates or merges into existing rows).
 * If cycleName matches an existing cycle (case-insensitive), the new
 * record is assigned to it; otherwise it is created with no cycle and
 * only appears under "All Cycles".
 */
export async function importUniversities(
  rows: {
    name: string;
    region: string;
    status: University["status"];
    tuition: number;
    currency: string;
    startDate: string | null;
    deadline: string | null;
    applicationLink: string;
    notes: string;
    checklistItems: string[];
    cycleId: string | null;
  }[],
): Promise<{ created: number; failures: string[] }> {
  let created = 0;
  const failures: string[] = [];

  for (const row of rows) {
    try {
      const uni = await createUniversity({
        cycleId: row.cycleId,
        name: row.name,
        region: row.region,
        status: row.status,
        tuition: row.tuition,
        currency: row.currency,
        startDate: row.startDate,
        deadline: row.deadline,
        applicationLink: row.applicationLink,
        notes: row.notes,
      });

      // createUniversity seeds the default checklist; replace it with the
      // imported checklist items (if any) so the import reflects exactly
      // what was in the spreadsheet rather than a generic template.
      await Promise.all(
        uni.checklist.map((item) => deleteChecklistItem(item.id)),
      );
      if (row.checklistItems.length > 0) {
        await supabase.from("checklist").insert(
          row.checklistItems.map((item) => ({
            university_id: uni.id,
            item,
            completed: false,
          })),
        );
      }

      created++;
    } catch (e: any) {
      failures.push(`${row.name}: ${e.message}`);
    }
  }

  return { created, failures };
}

/**
 * Duplicate a university into another cycle as a fully independent record.
 * Copies name, region, tuition, currency, dates, link, notes, and checklist
 * items (reset to incomplete). Status resets to "not-started" since a
 * decision from a previous cycle should never carry forward. Scholarship
 * links are not copied: they point at scholarship rows scoped to the source
 * cycle and would not make sense attached to a different cycle's record.
 */
export async function duplicateUniversity(
  id: string,
  targetCycleId: string | null,
): Promise<University> {
  const source = await getUniversity(id);

  const created = await createUniversity({
    cycleId: targetCycleId,
    name: source.name,
    region: source.region,
    status: "not-started",
    tuition: source.tuition,
    currency: source.currency,
    startDate: source.startDate,
    deadline: source.deadline,
    applicationLink: source.applicationLink ?? "",
    notes: source.notes ?? "",
  });

  // createUniversity already seeded the default checklist items; remove
  // them and replace with an exact copy of the source's checklist so the
  // duplicate mirrors the original rather than a generic template.
  await Promise.all(
    created.checklist.map((item) => deleteChecklistItem(item.id)),
  );
  if (source.checklist.length > 0) {
    await supabase.from("checklist").insert(
      source.checklist.map((item) => ({
        university_id: created.id,
        item: item.item,
        completed: false,
      })),
    );
  }

  return getUniversity(created.id);
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export async function addChecklistItem(
  universityId: string,
  item: string,
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from("checklist")
    .insert({ university_id: universityId, item, completed: false })
    .select()
    .single();

  if (error) throw new Error(parseSupabaseError(error));
  return {
    id: data.id,
    universityId: data.university_id,
    item: data.item,
    completed: data.completed,
  };
}

export async function updateChecklistItem(
  id: string,
  completed: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("checklist")
    .update({ completed })
    .eq("id", id);

  if (error) throw new Error(parseSupabaseError(error));
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabase.from("checklist").delete().eq("id", id);
  if (error) throw new Error(parseSupabaseError(error));
}
