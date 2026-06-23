import { downloadTextFile } from "./csv";

export interface DeadlineEvent {
  id: string;
  type: "university" | "scholarship";
  name: string;
  deadline: string; // ISO date string, e.g. "2026-12-15"
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function toIcsDate(dateStr: string): string {
  // All-day event date format: YYYYMMDD
  return dateStr.replace(/-/g, "");
}

function foldLine(line: string): string {
  // RFC 5545 recommends folding lines longer than 75 octets; our lines are
  // short enough in practice that this is mostly a no-op, but kept for
  // correctness with longer names/notes.
  if (line.length <= 75) return line;
  let result = "";
  let remaining = line;
  while (remaining.length > 75) {
    result += remaining.slice(0, 75) + "\r\n ";
    remaining = remaining.slice(75);
  }
  return result + remaining;
}

/**
 * Build a single .ics calendar file containing one all-day event per
 * deadline, importable into Google Calendar, Outlook, or Apple Calendar.
 * This is a static export, not a live-syncing calendar feed: re-export
 * and re-import if deadlines change.
 */
export function exportDeadlinesToIcs(events: DeadlineEvent[]): void {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Application Tracker//Deadlines//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of events) {
    if (!event.deadline) continue;
    const dateOnly = event.deadline.slice(0, 10);
    const summary = escapeIcsText(
      `${event.name} deadline (${event.type === "university" ? "University" : "Scholarship"})`,
    );

    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.type}-${event.id}@application-tracker`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${toIcsDate(dateOnly)}`,
      `SUMMARY:${summary}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  const ics = lines.map(foldLine).join("\r\n");
  downloadTextFile("application-deadlines.ics", ics, "text/calendar");
}
