import { z } from "zod";

const finite = z.number().finite();
export const snapshotSchema = z.object({
  vaults: z.array(z.object({ id: z.string(), key: z.string().optional(), name: z.string(), pct: finite.min(0).max(100), balance: finite, color: z.string() })),
  txs: z.array(z.object({ id: z.string(), type: z.enum(["income", "expense", "goal"]), amount: finite.positive(), note: z.string(), date: z.string(), vaultId: z.string().nullable(), createdAt: finite, allocations: z.array(z.object({ vaultId: z.string(), amount: finite })).optional(), installmentId: z.string().optional(), installmentIndex: finite.int().min(0).optional() })),
  goals: z.array(z.object({ id: z.string(), name: z.string(), target: finite, saved: finite, deadline: z.string(), vaultId: z.string(), createdAt: finite, allocations: z.array(z.object({ vaultId: z.string(), amount: finite })).optional() })),
  installments: z.array(z.object({
    id: z.string(), name: z.string().min(1), amount: finite.positive(), months: finite.int().min(1),
    firstMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), dueDay: finite.int().min(1).max(31),
    reminderDays: finite.int().min(0), vaultId: z.string(), createdAt: finite,
    payments: z.array(z.object({ index: finite.int().min(0), txId: z.string(), date: z.string(), amount: finite.positive() })),
    notified: z.array(finite.int().min(0)),
  })).default([]),
  reminders: z.array(z.object({ id: z.string(), title: z.string(), date: z.string(), time: z.string(), repeat: z.enum(["once", "daily", "weekly", "weekdays", "monthly", "yearly", "interval"]), intervalValue: finite, intervalUnit: z.enum(["minutes", "hours", "days", "weeks", "months"]), goalId: z.string().nullable(), enabled: z.boolean(), sound: z.string(), snoozeMin: finite, vibrate: z.boolean(), nextAt: finite.nullable(), lastFired: finite.optional() })),
  settings: z.object({ name: z.string(), currency: z.string(), lang: z.string() }),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
export const selectSnapshot = (s: Snapshot): Snapshot => ({ vaults: s.vaults, txs: s.txs, goals: s.goals, installments: s.installments, reminders: s.reminders, settings: s.settings });