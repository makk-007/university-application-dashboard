import { supabase } from "../app/lib/supabase";
import { AmountHistoryEntry } from "../app/types";
import { parseSupabaseError } from "./errors";

function rowToEntry(row: any): AmountHistoryEntry {
  return {
    id: row.id,
    fromAmount: row.from_amount !== null ? Number(row.from_amount) : null,
    toAmount: Number(row.to_amount),
    currency: row.currency,
    changedAt: row.changed_at,
  };
}

/**
 * Record a tuition change for a university. Logging failures are
 * swallowed rather than thrown, since a missing history entry should
 * never block the tuition update itself from succeeding.
 */
export async function logUniversityAmountChange(
  universityId: string,
  fromAmount: number | null,
  toAmount: number,
  currency: string,
): Promise<void> {
  if (fromAmount === toAmount) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("amount_history").insert({
    user_id: user.id,
    university_id: universityId,
    from_amount: fromAmount,
    to_amount: toAmount,
    currency,
  });

  if (error) console.error("Failed to log amount history:", error.message);
}

/** Record an amount change for a scholarship. Same failure handling as above. */
export async function logScholarshipAmountChange(
  scholarshipId: string,
  fromAmount: number | null,
  toAmount: number,
  currency: string,
): Promise<void> {
  if (fromAmount === toAmount) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("amount_history").insert({
    user_id: user.id,
    scholarship_id: scholarshipId,
    from_amount: fromAmount,
    to_amount: toAmount,
    currency,
  });

  if (error) console.error("Failed to log amount history:", error.message);
}

export async function getUniversityAmountHistory(
  universityId: string,
): Promise<AmountHistoryEntry[]> {
  const { data, error } = await supabase
    .from("amount_history")
    .select("*")
    .eq("university_id", universityId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(parseSupabaseError(error));
  return (data ?? []).map(rowToEntry);
}

export async function getScholarshipAmountHistory(
  scholarshipId: string,
): Promise<AmountHistoryEntry[]> {
  const { data, error } = await supabase
    .from("amount_history")
    .select("*")
    .eq("scholarship_id", scholarshipId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(parseSupabaseError(error));
  return (data ?? []).map(rowToEntry);
}
