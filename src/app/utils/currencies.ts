import { FX_TO_GHS } from "../types";

const STORAGE_KEY = "uat-custom-currencies";

export interface CustomCurrency {
  code: string;
  rateToGhs: number;
}

/**
 * The default currency codes and exchange rates (FX_TO_GHS) are baked
 * into the app and cannot be removed, since existing records may already
 * use them. Custom currencies added here are stored per-browser in
 * localStorage and merged on top of the defaults everywhere a currency
 * picker or a GHS conversion happens.
 */
export function getCustomCurrencies(): CustomCurrency[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is CustomCurrency =>
        typeof c?.code === "string" && typeof c?.rateToGhs === "number",
    );
  } catch {
    return [];
  }
}

function saveCustomCurrencies(currencies: CustomCurrency[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
}

export function addCustomCurrency(
  code: string,
  rateToGhs: number,
): CustomCurrency[] {
  const normalized = code.trim().toUpperCase();
  const current = getCustomCurrencies().filter((c) => c.code !== normalized);
  const updated = [...current, { code: normalized, rateToGhs }];
  saveCustomCurrencies(updated);
  return updated;
}

export function removeCustomCurrency(code: string): CustomCurrency[] {
  const updated = getCustomCurrencies().filter((c) => c.code !== code);
  saveCustomCurrencies(updated);
  return updated;
}

/** Every selectable currency code: built-in defaults plus custom ones. */
export function getAllCurrencyCodes(): string[] {
  const defaults = Object.keys(FX_TO_GHS);
  const custom = getCustomCurrencies().map((c) => c.code);
  return [...defaults, ...custom.filter((c) => !defaults.includes(c))];
}

/** GHS exchange rate for a currency, checking custom currencies first. */
export function getExchangeRate(code: string): number {
  const custom = getCustomCurrencies().find((c) => c.code === code);
  if (custom) return custom.rateToGhs;
  return FX_TO_GHS[code] ?? 1;
}

/** Whether a code is one of the built-in defaults, which cannot be removed. */
export function isDefaultCurrency(code: string): boolean {
  return code in FX_TO_GHS;
}
