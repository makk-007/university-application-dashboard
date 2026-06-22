import { supabase } from "../app/lib/supabase";
import { ApplicationCycle } from "../app/types";
import { parseSupabaseError } from "./errors";
import { getUniversities, duplicateUniversity } from "./universities";
import { getScholarships, duplicateScholarship } from "./scholarships";

// ── Mappers ──────────────────────────────────────────────────────────────────

function rowToCycle(row: any): ApplicationCycle {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    isActive: row.is_active ?? false,
    createdAt: row.created_at,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getCycles(): Promise<ApplicationCycle[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: rows, error } = await supabase
    .from("application_cycles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(parseSupabaseError(error));
  return (rows ?? []).map(rowToCycle);
}

export async function getActiveCycle(): Promise<ApplicationCycle | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("application_cycles")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(parseSupabaseError(error));
  return row ? rowToCycle(row) : null;
}

export async function createCycle(
  data: Omit<ApplicationCycle, "id" | "createdAt">,
): Promise<ApplicationCycle> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // If this new cycle is being created as active, deactivate any existing
  // active cycle first so the one-active-cycle-per-user constraint holds.
  if (data.isActive) {
    await supabase
      .from("application_cycles")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);
  }

  const { data: row, error } = await supabase
    .from("application_cycles")
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description ?? "",
      start_date: data.startDate ?? null,
      end_date: data.endDate ?? null,
      is_active: data.isActive ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(parseSupabaseError(error));
  return rowToCycle(row);
}

export async function updateCycle(
  id: string,
  data: Partial<Omit<ApplicationCycle, "id" | "createdAt">>,
): Promise<void> {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.endDate !== undefined) updateData.end_date = data.endDate;

  // isActive changes go through setActiveCycle, not a plain update, so the
  // one-active-cycle constraint is always respected.
  if (data.isActive !== undefined) {
    await setActiveCycle(id, data.isActive);
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("application_cycles")
      .update(updateData)
      .eq("id", id);

    if (error) throw new Error(parseSupabaseError(error));
  }
}

export async function setActiveCycle(
  id: string,
  isActive: boolean = true,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (isActive) {
    // Deactivate the current active cycle (if any), then activate this one.
    const { error: deactivateError } = await supabase
      .from("application_cycles")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (deactivateError) throw new Error(parseSupabaseError(deactivateError));
  }

  const { error } = await supabase
    .from("application_cycles")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(parseSupabaseError(error));
}

export async function archiveCycle(id: string): Promise<void> {
  // Archiving just deactivates the cycle. We never delete cycles here, since
  // universities/scholarships use ON DELETE SET NULL and deleting a cycle
  // would orphan historical applications.
  const { error } = await supabase
    .from("application_cycles")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(parseSupabaseError(error));
}

export async function deleteCycle(id: string): Promise<void> {
  const { error } = await supabase
    .from("application_cycles")
    .delete()
    .eq("id", id);

  if (error) throw new Error(parseSupabaseError(error));
}

export interface DuplicateCycleResult {
  universitiesDuplicated: number;
  scholarshipsDuplicated: number;
  failures: string[];
}

/**
 * Duplicate every university and scholarship from one cycle into another,
 * reusing the same per-record duplicateUniversity/duplicateScholarship logic
 * used for single-item duplication (independent copies, checklist carried
 * over, status reset, cross-entity links dropped since they would not
 * resolve against the target cycle).
 *
 * Each record is duplicated independently: if one fails, the rest continue
 * rather than aborting the whole batch, and the failure is reported back
 * so the user knows exactly what didn't make it across.
 */
export async function duplicateCycleContents(
  sourceCycleId: string,
  targetCycleId: string,
): Promise<DuplicateCycleResult> {
  const [universities, scholarships] = await Promise.all([
    getUniversities(sourceCycleId),
    getScholarships(sourceCycleId),
  ]);

  const failures: string[] = [];
  let universitiesDuplicated = 0;
  let scholarshipsDuplicated = 0;

  for (const uni of universities) {
    try {
      await duplicateUniversity(uni.id, targetCycleId);
      universitiesDuplicated++;
    } catch (e: any) {
      failures.push(`${uni.name}: ${e.message}`);
    }
  }

  for (const schol of scholarships) {
    try {
      await duplicateScholarship(schol.id, targetCycleId);
      scholarshipsDuplicated++;
    } catch (e: any) {
      failures.push(`${schol.name}: ${e.message}`);
    }
  }

  return { universitiesDuplicated, scholarshipsDuplicated, failures };
}
