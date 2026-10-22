import { describe, expect, it } from "vitest";
import { getPageItems } from "./pagination";

describe("getPageItems", () => {
  it("shows every page when there are only a few", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(1, 2)).toEqual([1, 2]);
    expect(getPageItems(2, 3)).toEqual([1, 2, 3]);
  });

  it("collapses the far end behind an ellipsis from the first page", () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, "…", 5]);
  });

  it("shows neighbours of the current page with no gaps in the middle", () => {
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the near end behind an ellipsis from the last page", () => {
    expect(getPageItems(5, 5)).toEqual([1, "…", 4, 5]);
  });

  it("puts an ellipsis on both sides of a middle page", () => {
    expect(getPageItems(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
  });
});
