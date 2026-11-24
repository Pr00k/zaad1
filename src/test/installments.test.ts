import { beforeEach, describe, expect, it } from "vitest";
import { useZad } from "@/lib/store";
import { dueInstallmentAlerts, installmentDueDate } from "@/lib/installments";

describe("All-vault goals and installments", () => {
  beforeEach(() => useZad.getState().reset());

  it("funds an all-vault goal by allocation and refunds the exact shares on deletion", () => {
    useZad.getState().addIncome(1000, "", "2026-11-23", null);
    useZad.getState().saveGoal({ name: "Car", target: 500, vaultId: "all" });
    const goal = useZad.getState().goals[0]!;
    expect(useZad.getState().contribute(goal.id, 100)).toEqual({ ok: true });
    expect(useZad.getState().vaults.map((v) => v.balance)).toEqual([450, 135, 90, 90, 90, 45, 0]);
    useZad.getState().deleteGoal(goal.id);
    expect(useZad.getState().vaults.map((v) => v.balance)).toEqual([500, 150, 100, 100, 100, 50, 0]);
  });

  it("records a monthly installment payment once from all vaults and undo reopens it", () => {
    useZad.getState().addIncome(1000, "", "2026-11-23", null);
    expect(useZad.getState().saveInstallment({ name: "Phone", amount: 100, months: 12, firstMonth: "2026-12", dueDay: 10, reminderDays: 3, vaultId: "all" })).toEqual({ ok: true });
    const plan = useZad.getState().installments[0]!;
    expect(useZad.getState().payInstallment(plan.id, 0, "2026-12-10")).toEqual({ ok: true });
    expect(useZad.getState().payInstallment(plan.id, 0, "2026-12-10")).toEqual({ ok: false, error: "alreadyPaid" });
    expect(useZad.getState().vaults.reduce((sum, v) => sum + v.balance, 0)).toBe(900);
    useZad.getState().deleteTx(useZad.getState().txs[0]!.id);
    expect(useZad.getState().installments[0]!.payments).toEqual([]);
    expect(useZad.getState().vaults.reduce((sum, v) => sum + v.balance, 0)).toBe(1000);
  });

  it("alerts the chosen number of days before the selected payment day", () => {
    useZad.getState().saveInstallment({ name: "Rent", amount: 50, months: 2, firstMonth: "2026-02", dueDay: 31, reminderDays: 3, vaultId: "all" });
    const plan = useZad.getState().installments[0]!;
    expect(installmentDueDate(plan, 0).getDate()).toBe(28);
    expect(dueInstallmentAlerts([plan], new Date(2026, 1, 25, 8).getTime())).toHaveLength(0);
    expect(dueInstallmentAlerts([plan], new Date(2026, 1, 25, 9).getTime())).toHaveLength(1);
  });
});