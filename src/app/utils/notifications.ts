/**
 * Thin wrapper around the browser Notification API.
 *
 * This is an in-session, app-open notification mechanism, not true
 * background push: a service worker and a push backend would be required
 * for notifications to fire while the app is closed, which is out of
 * scope for this client-only Vite app. What this provides is: while the
 * person has the app open in a tab, deadline notifications fire once per
 * item per day rather than every time the dashboard re-renders.
 */

const STORAGE_KEY = "uat-notified-deadlines";
const PERMISSION_PROMPTED_KEY = "uat-notification-permission-asked";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  localStorage.setItem(PERMISSION_PROMPTED_KEY, "true");
  return Notification.requestPermission();
}

export function hasPromptedForPermission(): boolean {
  return localStorage.getItem(PERMISSION_PROMPTED_KEY) === "true";
}

function getNotifiedToday(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function markNotified(key: string): void {
  const map = getNotifiedToday();
  map[key] = new Date().toDateString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function wasNotifiedToday(key: string): boolean {
  const map = getNotifiedToday();
  return map[key] === new Date().toDateString();
}

export interface DeadlineNotificationItem {
  id: string;
  type: "university" | "scholarship";
  name: string;
  daysUntil: number;
}

/**
 * Show a browser notification for each item that hasn't already been
 * notified today, if permission has been granted. Safe to call on every
 * dashboard load; already-notified items are skipped silently.
 */
export function notifyUpcomingDeadlines(
  items: DeadlineNotificationItem[],
): void {
  if (getNotificationPermission() !== "granted") return;

  for (const item of items) {
    const key = `${item.type}-${item.id}`;
    if (wasNotifiedToday(key)) continue;

    const dayLabel =
      item.daysUntil === 0
        ? "today"
        : item.daysUntil === 1
          ? "tomorrow"
          : `in ${item.daysUntil} days`;

    new Notification(`Deadline ${dayLabel}: ${item.name}`, {
      body:
        item.type === "university"
          ? "University application deadline"
          : "Scholarship application deadline",
      tag: key,
    });

    markNotified(key);
  }
}
