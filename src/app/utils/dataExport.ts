import { University, Scholarship, ApplicationCycle } from "../types";
import { toCsv, downloadTextFile } from "./csv";

export interface ExportBundle {
  exportedAt: string;
  cycles: ApplicationCycle[];
  universities: University[];
  scholarships: Scholarship[];
}

function timestampForFilename(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

/** Full-fidelity JSON export, suitable for backup or re-import elsewhere. */
export function exportToJson(bundle: ExportBundle): void {
  const json = JSON.stringify(bundle, null, 2);
  downloadTextFile(
    `application-tracker-backup-${timestampForFilename()}.json`,
    json,
    "application/json",
  );
}

const UNIVERSITY_CSV_HEADERS = [
  "name",
  "region",
  "status",
  "tuition",
  "currency",
  "start_date",
  "deadline",
  "application_link",
  "notes",
  "checklist_items",
  "cycle_name",
];

export function exportUniversitiesToCsv(
  universities: University[],
  cycles: ApplicationCycle[],
): void {
  const cycleNameById = new Map(cycles.map((c) => [c.id, c.name]));
  const rows = universities.map((u) => [
    u.name,
    u.region,
    u.status,
    u.tuition,
    u.currency,
    u.startDate ?? "",
    u.deadline ?? "",
    u.applicationLink ?? "",
    u.notes ?? "",
    u.checklist.map((c) => c.item).join("; "),
    u.cycleId ? (cycleNameById.get(u.cycleId) ?? "") : "",
  ]);
  const csv = toCsv(UNIVERSITY_CSV_HEADERS, rows);
  downloadTextFile(
    `universities-${timestampForFilename()}.csv`,
    csv,
    "text/csv",
  );
}

const SCHOLARSHIP_CSV_HEADERS = [
  "name",
  "status",
  "amount",
  "currency",
  "coverage",
  "start_date",
  "deadline",
  "link",
  "notes",
  "checklist_items",
  "cycle_name",
];

export function exportScholarshipsToCsv(
  scholarships: Scholarship[],
  cycles: ApplicationCycle[],
): void {
  const cycleNameById = new Map(cycles.map((c) => [c.id, c.name]));
  const rows = scholarships.map((s) => [
    s.name,
    s.status,
    s.amount,
    s.currency,
    s.coverage,
    s.startDate ?? "",
    s.deadline ?? "",
    s.link ?? "",
    s.notes ?? "",
    s.checklist.map((c) => c.item).join("; "),
    s.cycleId ? (cycleNameById.get(s.cycleId) ?? "") : "",
  ]);
  const csv = toCsv(SCHOLARSHIP_CSV_HEADERS, rows);
  downloadTextFile(
    `scholarships-${timestampForFilename()}.csv`,
    csv,
    "text/csv",
  );
}
