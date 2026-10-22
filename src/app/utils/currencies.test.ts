import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addCustomCurrency,
  getAllCurrencyCodes,
  getCustomCurrencies,
  getExchangeRate,
  isDefaultCurrency,
  removeCustomCurrency,
} from "./currencies";

function installFakeLocalStorage(): Map<string, string> {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
  return store;
}

describe("currencies", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = installFakeLocalStorage();
  });

  it("returns built-in rates and falls back to 1 for unknown codes", () => {
    expect(getExchangeRate("USD")).toBe(13.5);
    expect(getExchangeRate("GHS")).toBe(1);
    expect(getExchangeRate("XYZ")).toBe(1);
  });

  it("normalizes added codes to upper case and replaces duplicates", () => {
    addCustomCurrency(" jpy ", 0.09);
    expect(getCustomCurrencies()).toEqual([{ code: "JPY", rateToGhs: 0.09 }]);
    addCustomCurrency("JPY", 0.1);
    expect(getCustomCurrencies()).toEqual([{ code: "JPY", rateToGhs: 0.1 }]);
    expect(getExchangeRate("JPY")).toBe(0.1);
  });

  it("lets a custom rate override a built-in one", () => {
    addCustomCurrency("USD", 15);
    expect(getExchangeRate("USD")).toBe(15);
  });

  it("lists defaults plus custom codes without duplicates", () => {
    addCustomCurrency("JPY", 0.09);
    addCustomCurrency("USD", 15);
    const codes = getAllCurrencyCodes();
    expect(codes).toContain("JPY");
    expect(codes.filter((c) => c === "USD")).toHaveLength(1);
  });

  it("removes a custom currency", () => {
    addCustomCurrency("JPY", 0.09);
    expect(removeCustomCurrency("JPY")).toEqual([]);
    expect(getExchangeRate("JPY")).toBe(1);
  });

  it("ignores corrupt or malformed stored data", () => {
    store.set("uat-custom-currencies", "{not json");
    expect(getCustomCurrencies()).toEqual([]);
    store.set(
      "uat-custom-currencies",
      JSON.stringify([{ code: "AAA", rateToGhs: 2 }, { code: 5 }, "x"]),
    );
    expect(getCustomCurrencies()).toEqual([{ code: "AAA", rateToGhs: 2 }]);
  });

  it("knows which codes are built in", () => {
    expect(isDefaultCurrency("EUR")).toBe(true);
    expect(isDefaultCurrency("JPY")).toBe(false);
  });
});
