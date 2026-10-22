import { describe, expect, it } from "vitest";
import { parseScholarshipCsv, parseUniversityCsv } from "./dataImport";

describe("parseUniversityCsv", () => {
  it("returns nothing for empty input", () => {
    expect(parseUniversityCsv("")).toEqual({ valid: [], errors: [] });
  });

  it("fills defaults when only a name is given", () => {
    const { valid, errors } = parseUniversityCsv("name\nUniversity A");
    expect(errors).toEqual([]);
    expect(valid).toEqual([
      {
        rowNumber: 2,
        name: "University A",
        region: "Other",
        status: "not-started",
        tuition: 0,
        currency: "USD",
        startDate: null,
        deadline: null,
        applicationLink: "",
        notes: "",
        checklistItems: [],
        cycleName: "",
      },
    ]);
  });

  it("matches headers case-insensitively in any order", () => {
    const { valid } = parseUniversityCsv(
      "Region,NAME,Deadline\nEurope,Uni B,2026-12-15",
    );
    expect(valid[0]).toMatchObject({
      name: "Uni B",
      region: "Europe",
      deadline: "2026-12-15",
    });
  });

  it("accepts both the status key and its label", () => {
    const { valid, errors } = parseUniversityCsv(
      "name,status\nA,in-progress\nB,In Progress",
    );
    expect(errors).toEqual([]);
    expect(valid.map((v) => v.status)).toEqual(["in-progress", "in-progress"]);
  });

  it("reports bad rows by spreadsheet row number and keeps good ones", () => {
    const { valid, errors } = parseUniversityCsv(
      [
        "name,status,tuition",
        "Good,submitted,100",
        ",submitted,100",
        "BadStatus,nonsense,100",
        "BadTuition,submitted,lots",
      ].join("\n"),
    );
    expect(valid.map((v) => v.name)).toEqual(["Good"]);
    expect(errors).toEqual([
      { rowNumber: 3, message: 'Missing required "name" field' },
      { rowNumber: 4, message: 'Unrecognized status "nonsense"' },
      { rowNumber: 5, message: 'Tuition "lots" is not a number' },
    ]);
  });

  it("splits checklist items on semicolons and trims blanks", () => {
    const { valid } = parseUniversityCsv(
      'name,checklist_items\nA,"Essay; CV ;; References"',
    );
    expect(valid[0].checklistItems).toEqual(["Essay", "CV", "References"]);
  });
});

describe("parseScholarshipCsv", () => {
  it("fills defaults when only a name is given", () => {
    const { valid } = parseScholarshipCsv("name\nSchol A");
    expect(valid[0]).toMatchObject({
      name: "Schol A",
      status: "not-started",
      amount: 0,
      currency: "USD",
      coverage: "Full Scholarship",
    });
  });

  it("accepts coverage case-insensitively and rejects unknown values", () => {
    const { valid, errors } = parseScholarshipCsv(
      "name,coverage\nA,tuition only\nB,half price",
    );
    expect(valid.map((v) => v.coverage)).toEqual(["Tuition Only"]);
    expect(errors).toEqual([
      { rowNumber: 3, message: 'Unrecognized coverage "half price"' },
    ]);
  });

  it("rejects a non-numeric amount", () => {
    const { valid, errors } = parseScholarshipCsv("name,amount\nA,lots");
    expect(valid).toEqual([]);
    expect(errors).toEqual([
      { rowNumber: 2, message: 'Amount "lots" is not a number' },
    ]);
  });
});
