import { supabase } from "../app/lib/supabase";
import { Scholarship, ChecklistItem, ApplicationStatus } from "../app/types";
import { parseSupabaseError } from "./errors";

// ── Mappers ──────────────────────────────────────────────────────────────────

function rowToScholarship(
  row: any,
  checklist: ChecklistItem[] = [],
  eligibleUniversities: string[] = [],
): Scholarship {
  return {
    id: row.id,
    name: row.name,
    status: row.status as ApplicationStatus,
    amount: row.amount ?? 0,
    currency: row.currency ?? "GHS",
    coverage: row.coverage ?? "Full Scholarship",
    eligibleUniversities,
    notes: row.notes ?? "",
    link: row.link ?? "",
    startDate: row.start_date ?? null,
    deadline: row.deadline ?? null,
    checklist,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getScholarships(): Promise<Scholarship[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: schols, error } = await supabase
    .from("scholarships")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(parseSupabaseError(error));
  if (!schols || schols.length === 0) return [];

  const scholIds = schols.map((s) => s.id);

  const { data: checklistRows } = await supabase
    .from("scholarship_checklist")
    .select("*")
    .in("scholarship_id", scholIds)
    .order("created_at", { ascending: true });

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
      completed: row.completed,
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
    .order("created_at", { ascending: true });

  const { data: linkRows } = await supabase
    .from("scholarship_universities")
    .select("university_id")
    .eq("scholarship_id", id);

  const checklist: ChecklistItem[] = (checklistRows ?? []).map((row) => ({
    id: row.id,
    scholarshipId: row.scholarship_id,
    item: row.item,
    completed: row.completed,
  }));

  const eligibleUniversities = (linkRows ?? []).map((row) => row.university_id);

  return rowToScholarship(schol, checklist, eligibleUniversities);
}

export async function createScholarship(
  data: Omit<Scholarship, "id" | "checklist">,
): Promise<Scholarship> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: schol, error } = await supabase
    .from("scholarships")
    .insert({
      user_id: user.id,
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

  // Link universities
  if (data.eligibleUniversities.length > 0) {
    await setScholarshipUniversities(schol.id, data.eligibleUniversities);
  }

  return getScholarship(schol.id);
}

export async function updateScholarship(
  id: string,
  data: Partial<Omit<Scholarship, "id" | "checklist">>,
): Promise<void> {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.coverage !== undefined) updateData.coverage = data.coverage;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("scholarships")
      .update(updateData)
      .eq("id", id);
    if (error) throw new Error(parseSupabaseError(error));
  }

  // Update university links if provided
  if (data.eligibleUniversities !== undefined) {
    await setScholarshipUniversities(id, data.eligibleUniversities);
  }
}

export async function deleteScholarship(id: string): Promise<void> {
  const { error } = await supabase.from("scholarships").delete().eq("id", id);
  if (error) throw new Error(parseSupabaseError(error));
}

// ── University Links ──────────────────────────────────────────────────────────

export async function setScholarshipUniversities(
  scholarshipId: string,
  universityIds: string[],
): Promise<void> {
  // Delete all existing links
  await supabase
    .from("scholarship_universities")
    .delete()
    .eq("scholarship_id", scholarshipId);

  if (universityIds.length === 0) return;

  const { error } = await supabase.from("scholarship_universities").insert(
    universityIds.map((uid) => ({
      scholarship_id: scholarshipId,
      university_id: uid,
    })),
  );

  if (error) throw new Error(parseSupabaseError(error));
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export async function addScholarshipChecklistItem(
  scholarshipId: string,
  item: string,
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from("scholarship_checklist")
    .insert({ scholarship_id: scholarshipId, item, completed: false })
    .select()
    .single();

  if (error) throw new Error(parseSupabaseError(error));
  return {
    id: data.id,
    scholarshipId: data.scholarship_id,
    item: data.item,
    completed: data.completed,
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

export async function deleteScholarshipChecklistItem(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("scholarship_checklist")
    .delete()
    .eq("id", id);
  if (error) throw new Error(parseSupabaseError(error));
}
