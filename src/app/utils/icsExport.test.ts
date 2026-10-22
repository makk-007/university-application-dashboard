import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "./csv";
import { exportDeadlinesToIcs } from "./icsExport";

vi.mock("./csv", () => ({ downloadTextFile: vi.fn() }));

function exportAndGetIcs(
  events: Parameters<typeof exportDeadlinesToIcs>[0],
): string {
  exportDeadlinesToIcs(events);
  return vi.mocked(downloadTextFile).mock.calls[0][1];
}

describe("exportDeadlinesToIcs", () => {
  beforeEach(() => {
    vi.mocked(downloadTextFile).mockClear();
  });

  it("downloads a calendar file with the right name and type", () => {
    exportDeadlinesToIcs([]);
    expect(downloadTextFile).toHaveBeenCalledWith(
      "application-deadlines.ics",
      expect.any(String),
      "text/calendar",
    );
  });

  it("wraps events in a VCALENDAR with one all-day VEVENT per deadline", () => {
    const ics = exportAndGetIcs([
      { id: "u1", type: "university", name: "MIT", deadline: "2026-12-15" },
      {
        id: "s1",
        type: "scholarship",
        name: "Fulbright",
        deadline: "2027-01-05T00:00:00Z",
      },
    ]);
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines.at(-1)).toBe("END:VCALENDAR");
    expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(2);
    expect(lines).toContain("UID:university-u1@application-tracker");
    expect(lines).toContain("DTSTART;VALUE=DATE:20261215");
    // A full timestamp is cut down to its date.
    expect(lines).toContain("DTSTART;VALUE=DATE:20270105");
    expect(lines).toContain("SUMMARY:MIT deadline (University)");
    expect(lines).toContain("SUMMARY:Fulbright deadline (Scholarship)");
  });

  it("skips events with no deadline", () => {
    const ics = exportAndGetIcs([
      { id: "u1", type: "university", name: "A", deadline: "" },
    ]);
    expect(ics).not.toContain("BEGIN:VEVENT");
  });

  it("escapes commas, semicolons and backslashes in the summary", () => {
    const ics = exportAndGetIcs([
      { id: "u1", type: "university", name: "A, B; C\\D", deadline: "2026-12-15" },
    ]);
    expect(ics).toContain("SUMMARY:A\\, B\\; C\\\\D deadline (University)");
  });

  it("folds lines longer than 75 characters", () => {
    const ics = exportAndGetIcs([
      { id: "u1", type: "university", name: "N".repeat(120), deadline: "2026-12-15" },
    ]);
    const folded = ics.split("\r\n").filter((l) => l.startsWith(" "));
    expect(folded.length).toBeGreaterThan(0);
    for (const line of ics.split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(76);
    }
  });
});
