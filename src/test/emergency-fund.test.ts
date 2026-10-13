import { beforeEach, describe, expect, it } from "vitest";
import { addEmergencyVault, DEFAULT_VAULTS, useZad } from "@/lib/store";
import { dicts, greetingKey } from "@/lib/i18n";

describe("Emergency fund", () => {
  beforeEach(() => useZad.getState().reset());

  it("preserves existing balances and allocations during migration", () => {
    const existing = DEFAULT_VAULTS.filter((v) => v.id !== "emergency").map((v) => ({ ...v, balance: 125 }));
    const migrated = addEmergencyVault(existing);
    expect(migrated.slice(0, existing.length)).toEqual(existing);
    expect(migrated.at(-1)).toMatchObject({ id: "emergency", balance: 0, pct: 0 });
    expect(addEmergencyVault(migrated)).toBe(migrated);
    expect(migrated.reduce((sum, v) => sum + v.pct, 0)).toBe(100);
  });

  it("supports deposits and expenses without affecting other vaults", () => {
    const state = useZad.getState();
    expect(state.addIncome(500, "Reserve", "2026-10-13", "emergency")).toEqual({ ok: true });
    expect(state.addExpense(125, "Repair", "2026-10-13", "emergency")).toEqual({ ok: true });
    expect(useZad.getState().vaults.find((v) => v.id === "emergency")?.balance).toBe(375);
    expect(useZad.getState().vaults.filter((v) => v.id !== "emergency").every((v) => v.balance === 0)).toBe(true);
    expect(state.addExpense(400, "Repair", "2026-10-13", "emergency")).toEqual({ ok: false, error: "insufficient" });
  });

  it("does not divert automatically allocated income", () => {
    useZad.getState().addIncome(1000, "Income", "2026-10-13", null);
    expect(useZad.getState().vaults.find((v) => v.id === "emergency")?.balance).toBe(0);
    expect(useZad.getState().vaults.reduce((sum, v) => sum + v.balance, 0)).toBe(1000);
  });

  it("provides consistent localized wording", () => {
    expect(Object.keys(dicts.ar).sort()).toEqual(Object.keys(dicts.en).sort());
    expect(dicts.ar.emergency).toBe("صندوق الطوارئ");
    expect(dicts.en.emergency).toBe("Emergency fund");
    expect(dicts.ar[greetingKey(12)]).toBeTruthy();
  });
});