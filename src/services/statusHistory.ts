import { supabase } from "../app/lib/supabase";
import { ApplicationStatus, StatusHistoryEntry } from "../app/types";
import { parseSupabaseError } from "./errors";

export interface ActivityFeedEntry extends StatusHistoryEntry {
  entityType: "university" | "scholarship";
  entityId: string;
  entityName: string;
}

function rowToEntry(row: any): StatusHistoryEntry {
  return {
    id: row.id,
    fromStatus: row.from_status ?? null,
    toStatus: row.to_status,
    changedAt: row.changed_at,
  };
}

/**
 * Record a status change for a university. Logging failures are swallowed
 * rather than thrown, since a missing history entry should never block the
 * status update itself from succeeding.
 */
export async function logUniversityStatusChange(
  universityId: string,
  fromStatus: ApplicationStatus | null,
  toStatus: ApplicationStatus,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("status_history").insert({
    user_id: user.id,
    university_id: universityId,
    from_status: fromStatus,
    to_status: toStatus,
  });

  if (error) console.error("Failed to log status history:", error.message);
}

/** Record a status change for a scholarship. Same failure handling as above. */
export async function logScholarshipStatusChange(
  scholarshipId: string,
  fromStatus: ApplicationStatus | null,
  toStatus: ApplicationStatus,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("status_history").insert({
    user_id: user.id,
    scholarship_id: scholarshipId,
    from_status: fromStatus,
    to_status: toStatus,
  });

  if (error) console.error("Failed to log status history:", error.message);
}

export async function getUniversityStatusHistory(
  universityId: string,
): Promise<StatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from("status_history")
    .select("*")
    .eq("university_id", universityId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(parseSupabaseError(error));
  return (data ?? []).map(rowToEntry);
}

export async function getScholarshipStatusHistory(
  scholarshipId: string,
): Promise<StatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from("status_history")
    .select("*")
    .eq("scholarship_id", scholarshipId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(parseSupabaseError(error));
  return (data ?? []).map(rowToEntry);
}

/**
 * Recent status changes across every university and scholarship, most
 * recent first, with the entity's name attached via a single embedded
 * join per entity type rather than a separate lookup per row. Used for
 * the dashboard's activity feed.
 */
export async function getRecentActivity(
  limit = 20,
): Promise<ActivityFeedEntry[]> {
  const { data, error } = await supabase
    .from("status_history")
    .select(
      "id, from_status, to_status, changed_at, university_id, scholarship_id, universities(name), scholarships(name)",
    )
    .order("changed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(parseSupabaseError(error));

  return (data ?? [])
    .map((row: any) => {
      const isUniversity = row.university_id !== null;
      const entityName = isUniversity
        ? row.universities?.name
        : row.scholarships?.name;
      // history rows cascade-delete with their parent record, so this
      // should always resolve; skip defensively if it somehow doesn't,
      // rather than showing a blank name.
      if (!entityName) return null;
      return {
        id: row.id,
        fromStatus: row.from_status ?? null,
        toStatus: row.to_status,
        changedAt: row.changed_at,
        entityType: isUniversity ? "university" : "scholarship",
        entityId: isUniversity ? row.university_id : row.scholarship_id,
        entityName,
      } as ActivityFeedEntry;
    })
    .filter((entry): entry is ActivityFeedEntry => entry !== null);
}
