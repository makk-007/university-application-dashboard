import { supabase } from "../app/lib/supabase";
import { ApplicationStatus, StatusHistoryEntry } from "../app/types";
import { parseSupabaseError } from "./errors";

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
