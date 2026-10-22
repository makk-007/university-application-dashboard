import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDaysUntil,
  getDeadlineUrgency,
  isHighStakesTransition,
  isOverdue,
} from "./statusConfig";

describe("deadline helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("getDaysUntil counts whole days and handles no date", () => {
    expect(getDaysUntil(null)).toBeNull();
    expect(getDaysUntil("2026-06-11T00:00:00Z")).toBe(10);
    expect(getDaysUntil("2026-05-30T00:00:00Z")).toBe(-2);
  });

  it("getDeadlineUrgency uses 14 and 30 day thresholds", () => {
    expect(getDeadlineUrgency(null)).toBe("normal");
    expect(getDeadlineUrgency("2026-06-10T00:00:00Z")).toBe("urgent");
    expect(getDeadlineUrgency("2026-06-15T00:00:00Z")).toBe("warning");
    expect(getDeadlineUrgency("2026-07-31T00:00:00Z")).toBe("normal");
    // A deadline that already passed is treated as urgent.
    expect(getDeadlineUrgency("2026-05-01T00:00:00Z")).toBe("urgent");
  });

  it("isOverdue only flags open applications past their deadline", () => {
    const past = "2026-05-01T00:00:00Z";
    const future = "2026-08-01T00:00:00Z";
    expect(isOverdue("not-started", past)).toBe(true);
    expect(isOverdue("in-progress", past)).toBe(true);
    expect(isOverdue("submitted", past)).toBe(false);
    expect(isOverdue("withdrawn", past)).toBe(false);
    expect(isOverdue("in-progress", future)).toBe(false);
    expect(isOverdue("in-progress", null)).toBe(false);
  });
});

describe("isHighStakesTransition", () => {
  it("guards only leaving accepted or awarded for another status", () => {
    expect(isHighStakesTransition("accepted", "rejected")).toBe(true);
    expect(isHighStakesTransition("awarded", "in-progress")).toBe(true);
    expect(isHighStakesTransition("accepted", "accepted")).toBe(false);
    expect(isHighStakesTransition("not-started", "accepted")).toBe(false);
    expect(isHighStakesTransition("in-progress", "submitted")).toBe(false);
  });
});
