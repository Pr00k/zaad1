import { z } from "zod";

const finite = z.number().finite();
export const snapshotSchema = z.object({
  vaults: z.array(z.object({ id: z.string(), key: z.string().optional(), name: z.string(), pct: finite.min(0).max(100), balance: finite, color: z.string() })),
  txs: z.array(z.object({ id: z.string(), type: z.enum(["income", "expense", "goal"]), amount: finite.positive(), note: z.string(), date: z.string(), vaultId: z.string().nullable(), createdAt: finite, allocations: z.array(z.object({ vaultId: z.string(), amount: finite })).optional() })),
  goals: z.array(z.object({ id: z.string(), name: z.string(), target: finite, saved: finite, deadline: z.string(), vaultId: z.string(), createdAt: finite })),
  reminders: z.array(z.object({ id: z.string(), title: z.string(), date: z.string(), time: z.string(), repeat: z.enum(["once", "daily", "weekly", "weekdays", "monthly", "yearly", "interval"]), intervalValue: finite, intervalUnit: z.enum(["minutes", "hours", "days", "weeks", "months"]), goalId: z.string().nullable(), enabled: z.boolean(), sound: z.string(), snoozeMin: finite, vibrate: z.boolean(), nextAt: finite.nullable(), lastFired: finite.optional() })),
  settings: z.object({ name: z.string(), currency: z.string(), lang: z.string() }),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
export const selectSnapshot = (s: Snapshot): Snapshot => ({ vaults: s.vaults, txs: s.txs, goals: s.goals, reminders: s.reminders, settings: s.settings });