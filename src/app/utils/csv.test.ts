import { describe, expect, it } from "vitest";
import { csvEscape, parseCsv, toCsv } from "./csv";

describe("csvEscape", () => {
  it("leaves plain values alone and blanks null and undefined", () => {
    expect(csvEscape("plain")).toBe("plain");
    expect(csvEscape(42)).toBe("42");
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("quotes values containing commas, quotes or newlines", () => {
    expect(csvEscape("a,b")).toBe('"a,b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsv", () => {
  it("joins header and rows with CRLF and escapes cells", () => {
    expect(toCsv(["name", "notes"], [["A", "x,y"], ["B", null]])).toBe(
      'name,notes\r\nA,"x,y"\r\nB,',
    );
  });
});

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("handles CRLF line endings and a missing trailing newline", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("respects quoted commas, escaped quotes and embedded newlines", () => {
    expect(parseCsv('n,t\n"a,b","say ""hi"""\n"x\ny",z')).toEqual([
      ["n", "t"],
      ["a,b", 'say "hi"'],
      ["x\ny", "z"],
    ]);
  });

  it("strips a leading UTF-8 BOM", () => {
    expect(parseCsv("\uFEFFa,b\n1,2")[0]).toEqual(["a", "b"]);
  });

  it("drops fully blank lines", () => {
    expect(parseCsv("a,b\n\n1,2\n\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("round-trips whatever toCsv produces", () => {
    const rows = [
      ["Uni, with comma", 'He said "yes"', "multi\nline"],
      ["Plain", "", "x"],
    ];
    const text = toCsv(["a", "b", "c"], rows);
    expect(parseCsv(text)).toEqual([["a", "b", "c"], ...rows]);
  });
});
