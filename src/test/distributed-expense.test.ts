import { beforeEach, describe, expect, it } from "vitest";
import { useZad } from "@/lib/store";

describe("All-vault expenses", () => {
  beforeEach(() => useZad.getState().reset());
  it("deducts proportionally while preserving allocations and zero-percent reserves", () => {
    useZad.getState().addIncome(1000, "", "2026-11-07", null);
    expect(useZad.getState().addExpense(100, "", "2026-11-07", "all")).toEqual({ ok: true });
    expect(useZad.getState().vaults.map((v) => v.balance)).toEqual([450, 135, 90, 90, 90, 45, 0]);
    expect(useZad.getState().vaults.map((v) => v.pct)).toEqual([50,15,10,10,10,5,0]);
  });
  it("rejects the entire expense when any allocated vault cannot cover its share", () => {
    useZad.getState().addIncome(1000, "", "2026-11-07", "essential");
    const before = useZad.getState().vaults;
    expect(useZad.getState().addExpense(100, "", "2026-11-07", "all")).toEqual({ ok: false, error: "insufficientAll" });
    expect(useZad.getState().vaults).toEqual(before);
    expect(useZad.getState().txs).toHaveLength(1);
  });
  it("deducts exact hundredths and reverses the original split after percentage changes", () => {
    useZad.getState().addIncome(100, "", "2026-11-07", null);
    const before = useZad.getState().vaults.map((v) => v.balance);
    useZad.getState().addExpense(0.03, "", "2026-11-07", "all");
    const tx = useZad.getState().txs[0];
    expect(tx?.allocations?.reduce((s, a) => s + Math.round(a.amount * 100), 0)).toBe(3);
    useZad.getState().saveVault({ id: "essential", pct: 70 });
    if (!tx) throw new Error("Missing transaction");
    useZad.getState().deleteTx(tx.id);
    expect(useZad.getState().vaults.map((v) => v.balance)).toEqual(before);
    useZad.getState().restoreTx(tx);
    expect(Math.round(useZad.getState().vaults.reduce((s,v) => s + v.balance,0) * 100)).toBe(9997);
  });
});