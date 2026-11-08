import { beforeEach, describe, expect, it } from "vitest";
import { initial } from "@/lib/store";
import { readPersistedSnapshot } from "@/lib/financial-persistence";

describe("Financial hydration", () => {
  beforeEach(() => localStorage.clear());
  it("migrates legacy guest reserves with zero balance and allocation without changing money", () => {
    const state = initial();
    state.vaults = state.vaults.filter(v => v.id !== "emergency").map(v => ({ ...v, balance: 125 }));
    localStorage.setItem("zad-v4", JSON.stringify({ state, version: 1 }));
    const restored = readPersistedSnapshot(localStorage, "zad-v4");
    expect(restored?.vaults.slice(0, 6)).toEqual(state.vaults);
    expect(restored?.vaults.at(-1)).toMatchObject({ id: "emergency", pct: 0, balance: 0 });
  });
  it("preserves intentional emergency fund deletion at current version", () => {
    const state = initial();
    state.vaults = state.vaults.filter(v => v.id !== "emergency");
    localStorage.setItem("zad-v4", JSON.stringify({ state, version: 2 }));
    expect(readPersistedSnapshot(localStorage, "zad-v4")?.vaults).toEqual(state.vaults);
  });
  it("recovers account balances separately from guest and other accounts", () => {
    const state = initial();
    state.vaults[0] = { ...state.vaults[0], id: "essential", key: "essential", name: "", pct: 50, color: "var(--chart-1)", balance: 375 };
    localStorage.setItem("zad-account:a", JSON.stringify({ state, version: 2 }));
    expect(readPersistedSnapshot(localStorage, "zad-account:a")?.vaults[0]?.balance).toBe(375);
    expect(readPersistedSnapshot(localStorage, "zad-account:b")).toBeNull();
    expect(readPersistedSnapshot(localStorage, "zad-v4")).toBeNull();
  });
});