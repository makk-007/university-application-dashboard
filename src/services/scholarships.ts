import { supabase } from "../app/lib/supabase";
import { requireUserId } from "./session";
import {
  Scholarship,
  ChecklistItem,
  ApplicationStatus,
  DEFAULT_SCHOLARSHIP_CHECKLIST_ITEMS,
  BulkDeleteResult,
} from "../app/types";
import type { Tables, TablesUpdate } from "../app/lib/database.types";
import { parseSupabaseError, ConflictError, getErrorMessage } from "./errors";

// ── Mappers ──────────────────────────────────────────────────────────────────

function rowToScholarship(
  row: Tables<"scholarships">,
  checklist: ChecklistItem[] = [],
  eligibleUniversities: string[] = [],
): Scholarship {
  return {
    id: row.id,
    cycleId: row.cycle_id ?? null,
    name: row.name,
    status: row.status as ApplicationStatus,
    amount: row.amount ?? 0,
    currency: row.currency ?? "GHS",
    coverage: (row.coverage ?? "Full Scholarship") as Scholarship["coverage"],
    eligibleUniversities,
    notes: row.notes ?? "",
    link: row.link ?? "",
    startDate: row.start_date ?? null,
    deadline: row.deadline ?? null,
    updatedAt: row.updated_at ?? null,
    checklist,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getScholarships(
  cycleId?: string,
): Promise<Scholarship[]> {
  const userId = await requireUserId();

  let query = supabase.from("scholarships").select("*").eq("user_id", userId);

  if (cycleId) query = query.eq("cycle_id", cycleId);

  const { data: schols, error } = await query.order("created_at", {
    ascending: true,
  });

  if (error) throw new Error(parseSupabaseError(error));
  if (!schols || schols.length === 0) return [];

  const scholIds = schols.map((s) => s.id);

  const { data: checklistRows } = await supabase
    .from("scholarship_checklist")
    .select("*")
    .in("scholarship_id", scholIds)
    .order("sort_order", { ascending: true });

  const { data: linkRows } = await supabase
    .from("scholarship_universities")
    .select("scholarship_id, university_id")
    .in("scholarship_id", scholIds);

  const checklistMap: Record<string, ChecklistItem[]> = {};
  const uniMap: Record<string, string[]> = {};

  (checklistRows ?? []).forEach((row) => {
    if (!checklistMap[row.scholarship_id])
      checklistMap[row.scholarship_id] = [];
    checklistMap[row.scholarship_id].push({
      id: row.id,
      scholarshipId: row.scholarship_id,
      item: row.item,
      completed: row.completed ?? false,
      order: row.sort_order ?? 0,
    });
  });

  (linkRows ?? []).forEach((row) => {
    if (!uniMap[row.scholarship_id]) uniMap[row.scholarship_id] = [];
    uniMap[row.scholarship_id].push(row.university_id);
  });

  return schols.map((s) =>
    rowToScholarship(s, checklistMap[s.id] ?? [], uniMap[s.id] ?? []),
  );
}

export async function getScholarship(id: string): Promise<Scholarship> {
  const { data: schol, error } = await supabase
    .from("scholarships")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(parseSupabaseError(error));

  const { data: checklistRows } = await supabase
    .from("scholarship_checklist")
    .select("*")
    .eq("scholarship_id", id)
    .order("sort_order", { ascending: true });

  const { data: linkRows } = await supabase
    .from("scholarship_universities")
    .select("university_id")
    .eq("scholarship_id", id);

  const checklist: ChecklistItem[] = (checklistRows ?? []).map((row) => ({
    id: row.id,
    scholarshipId: row.scholarship_id,
    item: row.item,
    completed: row.completed ?? false,
    order: row.sort_order ?? 0,
  }));

  const eligibleUniversities = (linkRows ?? []).map((row) => row.university_id);

  return rowToScholarship(schol, checklist, eligibleUniversities);
}

export async function createScholarship(
  data: Omit<Scholarship, "id" | "checklist">,
  checklistItems: readonly string[] = DEFAULT_SCHOLARSHIP_CHECKLIST_ITEMS,
): Promise<Scholarship> {
  const userId = await requireUserId();

  const { data: schol, error } = await supabase
    .from("scholarships")
    .insert({
      user_id: userId,
      cycle_id: data.cycleId ?? null,
      name: data.name,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      coverage: data.coverage,
      notes: data.notes ?? "",
      link: data.link ?? "",
      start_date: data.startDate ?? null,
      deadline: data.deadline ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(parseSupabaseError(error));

  // Link universities and add the checklist: the defaults unless the caller
  // supplies its own items (an empty list means no checklist). If either step
  // fails, remove the new scholarship (its links and checklist cascade) so the
  // caller never ends up with a half-built record.
  try {
    if (data.eligibleUniversities.length > 0) {
      await setScholarshipUniversities(schol.id, data.eligibleUniversities);
    }

    if (checklistItems.length > 0) {
      const { error: checklistError } = await supabase
        .from("scholarship_checklist")
        .insert(
          checklistItems.map((item, index) => ({
            scholarship_id: schol.id,
            item,
            completed: false,
            sort_order: index,
          })),
        );
      if (checklistError) throw new Error(parseSupabaseError(checklistError));
    }
  } catch (e) {
    await supabase.from("scholarships").delete().eq("id", schol.id);
    throw e;
  }

  return getScholarship(schol.id);
}

export async function updateScholarship(
  id: string,
  data: Partial<Omit<Scholarship, "id" | "checklist">>,
  expectedUpdatedAt?: string | null,
): Promise<string | null> {
  const updateData: TablesUpdate<"scholarships"> = {};
  if (data.cycleId !== undefined) updateData.cycle_id = data.cycleId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.coverage !== undefined) updateData.coverage = data.coverage;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;

  let newUpdatedAt: string | null = expectedUpdatedAt ?? null;

  if (Object.keys(updateData).length > 0) {
    let query = supabase.from("scholarships").update(updateData).eq("id", id);
    if (expectedUpdatedAt) {
      query = query.eq("updated_at", expectedUpdatedAt);
    }
    const { data: updatedRows, error } = await query.select("id, updated_at");
    if (error) throw new Error(parseSupabaseError(error));
    if (expectedUpdatedAt && (!updatedRows || updatedRows.length === 0)) {
      throw new ConflictError();
    }
    newUpdatedAt = updatedRows?.[0]?.updated_at ?? newUpdatedAt;
  }

  // Update university links if provided
  if (data.eligibleUniversities !== undefined) {
    await setScholarshipUniversities(id, data.eligibleUniversities);
  }

  return newUpdatedAt;
}

export async function deleteScholarship(id: string): Promise<void> {
  const { error } = await supabase.from("scholarships").delete().eq("id", id);
  if (error) throw new Error(parseSupabaseError(error));
}

/**
 * Delete many scholarships in a single request when possible. Same
 * fast-path-then-fallback approach as deleteUniversities: a single
 * `DELETE ... WHERE id IN (...)` is atomic, so it cannot partially fail;
 * if that call itself fails, fall back to per-row deletes so deletable
 * rows still get removed and the rest are reported back by id.
 */
export async function deleteScholarships(
  ids: string[],
): Promise<BulkDeleteResult> {
  if (ids.length === 0) return { succeededIds: [], failures: [] };

  const { error } = await supabase.from("scholarships").delete().in("id", ids);

  if (!error) {
    return { succeededIds: ids, failures: [] };
  }

  const succeededIds: string[] = [];
  const failures: BulkDeleteResult["failures"] = [];
  for (const id of ids) {
    try {
      await deleteScholarship(id);
      succeededIds.push(id);
    } catch (e) {
      failures.push({ id, message: getErrorMessage(e) });
    }
  }
  return { succeededIds, failures };
}

/**
 * Create scholarships from parsed CSV import rows. Each row becomes a new,
 * independent record (this never updates or merges into existing rows).
 * Eligible universities are not part of the CSV format since they
 * reference internal IDs the user cannot reasonably author by hand; they
 * can be linked afterward from the scholarship's detail drawer.
 */
export async function importScholarships(
  rows: {
    name: string;
    status: Scholarship["status"];
    amount: number;
    currency: string;
    coverage: Scholarship["coverage"];
    startDate: string | null;
    deadline: string | null;
    link: string;
    notes: string;
    checklistItems: string[];
    cycleId: string | null;
  }[],
): Promise<{ created: number; failures: string[] }> {
  let created = 0;
  const failures: string[] = [];

  for (const row of rows) {
    try {
      // Pass the imported checklist items so the import reflects exactly
      // what was in the spreadsheet rather than a generic template.
      await createScholarship(
        {
          cycleId: row.cycleId,
          name: row.name,
          status: row.status,
          amount: row.amount,
          currency: row.currency,
          coverage: row.coverage,
          notes: row.notes,
          link: row.link,
          startDate: row.startDate,
          deadline: row.deadline,
          eligibleUniversities: [],
        },
        row.checklistItems,
      );

      created++;
    } catch (e) {
      failures.push(`${row.name}: ${getErrorMessage(e)}`);
    }
  }

  return { created, failures };
}

/**
 * Duplicate a scholarship into another cycle as a fully independent record.
 * Copies name, amount, currency, coverage, dates, link, notes, and checklist
 * items (reset to incomplete). Status resets to "not-started" since a
 * decision from a previous cycle should never carry forward. Eligible
 * university links are not copied: they reference university rows scoped to
 * the source cycle and would not resolve sensibly against the target cycle's
 * universities.
 */
export async function duplicateScholarship(
  id: string,
  targetCycleId: string | null,
): Promise<Scholarship> {
  const source = await getScholarship(id);

  // Pass the source's checklist so the duplicate mirrors the original
  // rather than a generic template.
  return createScholarship(
    {
      cycleId: targetCycleId,
      name: source.name,
      status: "not-started",
      amount: source.amount,
      currency: source.currency,
      coverage: source.coverage,
      notes: source.notes ?? "",
      link: source.link ?? "",
      startDate: source.startDate ?? null,
      deadline: source.deadline ?? null,
      eligibleUniversities: [],
    },
    source.checklist.map((item) => item.item),
  );
}

// ── University Links ──────────────────────────────────────────────────────────

export async function setScholarshipUniversities(
  scholarshipId: string,
  universityIds: string[],
): Promise<void> {
  const wanted = new Set(universityIds);

  const { data: existing, error: readError } = await supabase
    .from("scholarship_universities")
    .select("university_id")
    .eq("scholarship_id", scholarshipId);
  if (readError) throw new Error(parseSupabaseError(readError));

  const current = new Set((existing ?? []).map((row) => row.university_id));
  const toAdd = [...wanted].filter((uid) => !current.has(uid));
  const toRemove = [...current].filter((uid) => !wanted.has(uid));

  // Add the new links before removing the stale ones, so a failure part way
  // can never leave the scholarship with fewer links than it started with.
  if (toAdd.length > 0) {
    const { error } = await supabase.from("scholarship_universities").insert(
      toAdd.map((uid) => ({
        scholarship_id: scholarshipId,
        university_id: uid,
      })),
    );
    if (error) throw new Error(parseSupabaseError(error));
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("scholarship_universities")
      .delete()
      .eq("scholarship_id", scholarshipId)
      .in("university_id", toRemove);
    if (error) throw new Error(parseSupabaseError(error));
  }
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export async function addScholarshipChecklistItem(
  scholarshipId: string,
  item: string,
): Promise<ChecklistItem> {
  const { data: existing } = await supabase
    .from("scholarship_checklist")
    .select("sort_order")
    .eq("scholarship_id", scholarshipId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("scholarship_checklist")
    .insert({
      scholarship_id: scholarshipId,
      item,
      completed: false,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw new Error(parseSupabaseError(error));
  return {
    id: data.id,
    scholarshipId: data.scholarship_id,
    item: data.item,
    completed: data.completed ?? false,
    order: data.sort_order ?? 0,
  };
}

export async function updateScholarshipChecklistItem(
  id: string,
  completed: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("scholarship_checklist")
    .update({ completed })
    .eq("id", id);

  if (error) throw new Error(parseSupabaseError(error));
}

export async function renameScholarshipChecklistItem(
  id: string,
  item: string,
): Promise<void> {
  const { error } = await supabase
    .from("scholarship_checklist")
    .update({ item })
    .eq("id", id);

  if (error) throw new Error(parseSupabaseError(error));
}

export async function reorderScholarshipChecklistItems(
  orderedIds: string[],
): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("scholarship_checklist")
        .update({ sort_order: index })
        .eq("id", id),
    ),
  );
}

export async function deleteScholarshipChecklistItem(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("scholarship_checklist")
    .delete()
    .eq("id", id);
  if (error) throw new Error(parseSupabaseError(error));
}
