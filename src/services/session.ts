import { supabase } from "../app/lib/supabase";

/**
 * Returns the signed-in user's id, or null if nobody is signed in.
 *
 * Reads the locally stored session via getSession(), which makes no network
 * request (it refreshes the token only when it has expired). getUser() would
 * call the auth server on every service call. The id is only used to filter
 * and stamp rows; Row Level Security still enforces auth.uid() = user_id on
 * the server, so a stale or tampered local session cannot reach another
 * user's data.
 */
export async function getUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

/** Like getUserId, but throws when nobody is signed in. */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}
