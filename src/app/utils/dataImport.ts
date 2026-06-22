import { ApplicationStatus } from "../types";
import { ALL_STATUSES, statusConfig } from "./statusConfig";
import { parseCsv } from "./csv";

export interface ParsedUniversityRow {
  rowNumber: number;
  name: string;
  region: string;
  status: ApplicationStatus;
  tuition: number;
  currency: string;
  startDate: string | null;
  deadline: string | null;
  applicationLink: string;
  notes: string;
  checklistItems: string[];
  cycleName: string;
}

export interface ParsedScholarshipRow {
  rowNumber: number;
  name: string;
  status: ApplicationStatus;
  amount: number;
  currency: string;
  coverage:
    | "Full Scholarship"
    | "Tuition Only"
    | "Stipend Only"
    | "Tuition + Stipend";
  startDate: string | null;
  deadline: string | null;
  link: string;
  notes: string;
  checklistItems: string[];
  cycleName: string;
}

export interface ImportResult<T> {
  valid: T[];
  errors: { rowNumber: number; message: string }[];
}

const COVERAGE_OPTIONS = [
  "Full Scholarship",
  "Tuition Only",
  "Stipend Only",
  "Tuition + Stipend",
] as const;

function normalizeStatus(raw: string): ApplicationStatus | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  // Accept the raw key form, e.g. "in-progress".
  const directMatch = ALL_STATUSES.find((s) => s === lower);
  if (directMatch) return directMatch;

  // Accept the human label form, e.g. "In Progress".
  const labelMatch = ALL_STATUSES.find(
    (s) => statusConfig[s].label.toLowerCase() === lower,
  );
  if (labelMatch) return labelMatch;

  return null;
}

function normalizeCoverage(
  raw: string,
): (typeof COVERAGE_OPTIONS)[number] | null {
  const trimmed = raw.trim();
  const match = COVERAGE_OPTIONS.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase(),
  );
  return match ?? null;
}

function splitChecklist(raw: string): string[] {
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function indexHeaders(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((h, i) => map.set(h.trim().toLowerCase(), i));
  return map;
}

function cell(row: string[], index: Map<string, number>, key: string): string {
  const i = index.get(key);
  return i === undefined ? "" : (row[i] ?? "").trim();
}

/**
 * Parse and validate university CSV text. Expected headers (case
 * insensitive, order independent): name, region, status, tuition,
 * currency, start_date, deadline, application_link, notes,
 * checklist_items, cycle_name. Only name is strictly required; everything
 * else falls back to a sensible default so a partially-filled spreadsheet
 * still imports.
 */
export function parseUniversityCsv(
  text: string,
): ImportResult<ParsedUniversityRow> {
  const rows = parseCsv(text);
  if (rows.length === 0) return { valid: [], errors: [] };

  const index = indexHeaders(rows[0]);
  const valid: ParsedUniversityRow[] = [];
  const errors: ImportResult<ParsedUniversityRow>["errors"] = [];

  for (let i = 1; i < rows.length; i++) {
    const rowNumber = i + 1; // 1-indexed, header is row 1
    const row = rows[i];
    const name = cell(row, index, "name");
    if (!name) {
      errors.push({ rowNumber, message: 'Missing required "name" field' });
      continue;
    }

    const statusRaw = cell(row, index, "status");
    const status = statusRaw ? normalizeStatus(statusRaw) : "not-started";
    if (statusRaw && !status) {
      errors.push({
        rowNumber,
        message: `Unrecognized status "${statusRaw}"`,
      });
      continue;
    }

    const tuitionRaw = cell(row, index, "tuition");
    const tuition = tuitionRaw ? Number(tuitionRaw) : 0;
    if (tuitionRaw && Number.isNaN(tuition)) {
      errors.push({
        rowNumber,
        message: `Tuition "${tuitionRaw}" is not a number`,
      });
      continue;
    }

    valid.push({
      rowNumber,
      name,
      region: cell(row, index, "region") || "Other",
      status: status ?? "not-started",
      tuition,
      currency: cell(row, index, "currency") || "USD",
      startDate: cell(row, index, "start_date") || null,
      deadline: cell(row, index, "deadline") || null,
      applicationLink: cell(row, index, "application_link"),
      notes: cell(row, index, "notes"),
      checklistItems: splitChecklist(cell(row, index, "checklist_items")),
      cycleName: cell(row, index, "cycle_name"),
    });
  }

  return { valid, errors };
}

/**
 * Parse and validate scholarship CSV text. Expected headers (case
 * insensitive, order independent): name, status, amount, currency,
 * coverage, start_date, deadline, link, notes, checklist_items,
 * cycle_name. Only name is strictly required.
 */
export function parseScholarshipCsv(
  text: string,
): ImportResult<ParsedScholarshipRow> {
  const rows = parseCsv(text);
  if (rows.length === 0) return { valid: [], errors: [] };

  const index = indexHeaders(rows[0]);
  const valid: ParsedScholarshipRow[] = [];
  const errors: ImportResult<ParsedScholarshipRow>["errors"] = [];

  for (let i = 1; i < rows.length; i++) {
    const rowNumber = i + 1;
    const row = rows[i];
    const name = cell(row, index, "name");
    if (!name) {
      errors.push({ rowNumber, message: 'Missing required "name" field' });
      continue;
    }

    const statusRaw = cell(row, index, "status");
    const status = statusRaw ? normalizeStatus(statusRaw) : "not-started";
    if (statusRaw && !status) {
      errors.push({
        rowNumber,
        message: `Unrecognized status "${statusRaw}"`,
      });
      continue;
    }

    const amountRaw = cell(row, index, "amount");
    const amount = amountRaw ? Number(amountRaw) : 0;
    if (amountRaw && Number.isNaN(amount)) {
      errors.push({
        rowNumber,
        message: `Amount "${amountRaw}" is not a number`,
      });
      continue;
    }

    const coverageRaw = cell(row, index, "coverage");
    const coverage = coverageRaw
      ? normalizeCoverage(coverageRaw)
      : "Full Scholarship";
    if (coverageRaw && !coverage) {
      errors.push({
        rowNumber,
        message: `Unrecognized coverage "${coverageRaw}"`,
      });
      continue;
    }

    valid.push({
      rowNumber,
      name,
      status: status ?? "not-started",
      amount,
      currency: cell(row, index, "currency") || "USD",
      coverage: coverage ?? "Full Scholarship",
      startDate: cell(row, index, "start_date") || null,
      deadline: cell(row, index, "deadline") || null,
      link: cell(row, index, "link"),
      notes: cell(row, index, "notes"),
      checklistItems: splitChecklist(cell(row, index, "checklist_items")),
      cycleName: cell(row, index, "cycle_name"),
    });
  }

  return { valid, errors };
}
