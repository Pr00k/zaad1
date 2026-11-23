export interface InstallmentPayment { index: number; txId: string; date: string; amount: number }
export interface Installment {
  id: string; name: string; amount: number; months: number; firstMonth: string; dueDay: number;
  reminderDays: number; vaultId: string; payments: InstallmentPayment[]; notified: number[]; createdAt: number;
}

/** Anchor every occurrence to the chosen day, clamping only the short month. */
export function installmentDueDate(plan: Pick<Installment, "firstMonth" | "dueDay">, index: number): Date {
  const [year = 0, month = 1] = plan.firstMonth.split("-").map(Number);
  const first = new Date(year, month - 1 + index, 1, 9);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(plan.dueDay, lastDay), 9);
}

export function nextInstallmentIndex(plan: Installment): number | null {
  for (let index = 0; index < plan.months; index++) {
    if (!plan.payments.some((p) => p.index === index)) return index;
  }
  return null;
}

export function installmentAlertAt(plan: Installment, index: number): number {
  const date = installmentDueDate(plan, index);
  date.setDate(date.getDate() - plan.reminderDays);
  return date.getTime();
}

export function dueInstallmentAlerts(plans: Installment[], now: number) {
  return plans.flatMap((plan) => {
    const index = nextInstallmentIndex(plan);
    return index !== null && !plan.notified.includes(index) && installmentAlertAt(plan, index) <= now
      ? [{ plan, index }] : [];
  });
}