import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { computeNext, localDateStr, type Repeat, type Unit } from "./reminders";

export type Currency = string;
export interface Vault { id: string; key?: string; name: string; pct: number; balance: number; color: string }
export interface Tx { id: string; type: "income" | "expense" | "goal"; amount: number; note: string; date: string; vaultId: string | null; createdAt: number }
export interface Goal { id: string; name: string; target: number; saved: number; deadline: string; vaultId: string; createdAt: number }
export interface Reminder {
  id: string; title: string; date: string; time: string; repeat: Repeat; intervalValue: number; intervalUnit: Unit;
  goalId: string | null; enabled: boolean; sound: string; snoozeMin: number; vibrate: boolean; nextAt: number | null; lastFired?: number;
}
export interface Settings { name: string; currency: Currency; lang: string }

const uid = () => crypto.randomUUID();
const r2 = (n: number) => Math.round(n * 100) / 100;

export const DEFAULT_VAULTS: Vault[] = [
  { id: "essential", key: "essential", name: "", pct: 50, balance: 0, color: "var(--chart-1)" },
  { id: "savings", key: "savings", name: "", pct: 15, balance: 0, color: "var(--chart-2)" },
  { id: "investment", key: "investment", name: "", pct: 10, balance: 0, color: "var(--chart-3)" },
  { id: "learning", key: "learning", name: "", pct: 10, balance: 0, color: "var(--chart-4)" },
  { id: "lifestyle", key: "lifestyle", name: "", pct: 10, balance: 0, color: "var(--chart-5)" },
  { id: "giving", key: "giving", name: "", pct: 5, balance: 0, color: "var(--chart-6)" },
  { id: "emergency", key: "emergency", name: "", pct: 0, balance: 0, color: "var(--chart-3)" },
];

export function addEmergencyVault(vaults: Vault[]): Vault[] {
  if (vaults.some((v) => v.id === "emergency" || v.key === "emergency")) return vaults;
  const emergency = DEFAULT_VAULTS.find((v) => v.id === "emergency");
  return emergency ? [...vaults, { ...emergency }] : vaults;
}

type Result = { ok: true } | { ok: false; error: "insufficient" | "invalidAmount" };

interface State {
  vaults: Vault[]; txs: Tx[]; goals: Goal[]; reminders: Reminder[]; settings: Settings;
  addIncome(amount: number, note: string, date: string, vaultId: string | null): Result;
  addExpense(amount: number, note: string, date: string, vaultId: string): Result;
  deleteTx(id: string): Tx | undefined;
  restoreTx(tx: Tx): void;
  saveVault(v: Partial<Vault> & { id?: string }): void;
  deleteVault(id: string): void;
  setPcts(p: Record<string, number>): void;
  saveGoal(g: Partial<Goal> & { id?: string }): void;
  deleteGoal(id: string): void;
  contribute(goalId: string, amount: number): Result;
  saveReminder(r: Partial<Reminder> & { id?: string }): void;
  deleteReminder(id: string): void;
  toggleReminder(id: string): void;
  markFired(id: string): void;
  snooze(id: string): void;
  setSettings(s: Partial<Settings>): void;
  importData(json: string): boolean;
  reset(): void;
}

const initial = () => ({
  vaults: DEFAULT_VAULTS.map((v) => ({ ...v })), txs: [] as Tx[], goals: [] as Goal[], reminders: [] as Reminder[],
  settings: { name: "", currency: "IQD", lang: "ar" } as Settings,
});

export const useZad = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),
      addIncome(amount, note, date, vaultId) {
        if (!(amount > 0)) return { ok: false, error: "invalidAmount" };
        set((s) => {
          const total = s.vaults.reduce((a, v) => a + v.pct, 0) || 1;
          const vaults = s.vaults.map((v) =>
            vaultId ? (v.id === vaultId ? { ...v, balance: r2(v.balance + amount) } : v)
              : { ...v, balance: r2(v.balance + (amount * v.pct) / total) });
          return { vaults, txs: [{ id: uid(), type: "income", amount, note, date, vaultId, createdAt: Date.now() }, ...s.txs] };
        });
        return { ok: true };
      },
      addExpense(amount, note, date, vaultId) {
        if (!(amount > 0)) return { ok: false, error: "invalidAmount" };
        const v = get().vaults.find((x) => x.id === vaultId);
        if (!v || v.balance < amount) return { ok: false, error: "insufficient" };
        set((s) => ({
          vaults: s.vaults.map((x) => (x.id === vaultId ? { ...x, balance: r2(x.balance - amount) } : x)),
          txs: [{ id: uid(), type: "expense", amount, note, date, vaultId, createdAt: Date.now() }, ...s.txs],
        }));
        return { ok: true };
      },
      deleteTx(id) {
        const tx = get().txs.find((t) => t.id === id);
        if (!tx) return;
        set((s) => ({ txs: s.txs.filter((t) => t.id !== id), vaults: applyTx(s.vaults, tx, -1) }));
        return tx;
      },
      restoreTx(tx) {
        set((s) => ({ txs: [tx, ...s.txs].sort((a, b) => b.createdAt - a.createdAt), vaults: applyTx(s.vaults, tx, 1) }));
      },
      saveVault(v) {
        set((s): Partial<State> => {
          const id = v.id && s.vaults.some((x) => x.id === v.id) ? v.id : uid();
          const exists = id === v.id;
          let vaults: Vault[] = exists
            ? s.vaults.map((x): Vault => (x.id === id ? ({ ...x, ...v, ...(v.name ? { key: "" } : {}) } as Vault) : x))
            : [...s.vaults, { id, name: v.name ?? "", pct: 0, balance: 0, color: v.color ?? "var(--chart-2)" }];
          if (v.pct !== undefined) vaults = rebalancePcts(vaults, id, v.pct);
          return { vaults };
        });
      },
      deleteVault(id) {
        set((s) => {
          const victim = s.vaults.find((v) => v.id === id);
          const rest = s.vaults.filter((v) => v.id !== id);
          if (!victim || rest.length === 0) return s;
          const f = rest[0]!;
          rest[0] = { ...f, balance: r2(f.balance + victim.balance) };
          return { vaults: distributeTo100(rest), goals: s.goals.map((g) => (g.vaultId === id ? { ...g, vaultId: f.id } : g)) };
        });
      },
      setPcts(p) { set((s) => ({ vaults: s.vaults.map((v) => ({ ...v, pct: p[v.id] ?? v.pct })) })); },
      saveGoal(g) {
        set((s): Partial<State> => g.id
          ? { goals: s.goals.map((x) => (x.id === g.id ? { ...x, ...g } : x)) }
          : { goals: [...s.goals, { id: uid(), name: g.name ?? "", target: g.target ?? 0, saved: 0, deadline: g.deadline ?? "", vaultId: g.vaultId ?? s.vaults[0]?.id ?? "", createdAt: Date.now() }] });
      },
      deleteGoal(id) {
        set((s) => {
          const g = s.goals.find((x) => x.id === id);
          return {
            goals: s.goals.filter((x) => x.id !== id),
            vaults: g ? s.vaults.map((v) => (v.id === g.vaultId ? { ...v, balance: r2(v.balance + g.saved) } : v)) : s.vaults,
            reminders: s.reminders.map((r) => (r.goalId === id ? { ...r, goalId: null } : r)),
          };
        });
      },
      contribute(goalId, amount) {
        if (!(amount > 0)) return { ok: false, error: "invalidAmount" };
        const g = get().goals.find((x) => x.id === goalId);
        const v = g && get().vaults.find((x) => x.id === g.vaultId);
        if (!g || !v || v.balance < amount) return { ok: false, error: "insufficient" };
        set((s) => ({
          goals: s.goals.map((x) => (x.id === goalId ? { ...x, saved: r2(x.saved + amount) } : x)),
          vaults: s.vaults.map((x) => (x.id === v.id ? { ...x, balance: r2(x.balance - amount) } : x)),
          txs: [{ id: uid(), type: "goal", amount, note: g.name, date: localDateStr(), vaultId: v.id, createdAt: Date.now() }, ...s.txs],
        }));
        return { ok: true };
      },
      saveReminder(r) {
        set((s) => {
          const base: Reminder = r.id ? { ...s.reminders.find((x) => x.id === r.id)!, ...r } as Reminder : {
            id: uid(), title: "", date: localDateStr(), time: "09:00", repeat: "once", intervalValue: 1, intervalUnit: "hours",
            goalId: null, enabled: true, sound: "default", snoozeMin: 10, vibrate: true, nextAt: null, ...r,
          } as Reminder;
          base.nextAt = base.enabled ? computeNext(base) : null;
          return { reminders: r.id ? s.reminders.map((x) => (x.id === r.id ? base : x)) : [...s.reminders, base] };
        });
      },
      deleteReminder(id) { set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })); },
      toggleReminder(id) {
        set((s) => ({ reminders: s.reminders.map((r) => r.id !== id ? r : { ...r, enabled: !r.enabled, nextAt: !r.enabled ? computeNext(r) : null }) }));
      },
      markFired(id) {
        set((s) => ({ reminders: s.reminders.map((r) => {
          if (r.id !== id) return r;
          const nextAt = computeNext(r, Date.now() + 1000);
          return { ...r, lastFired: Date.now(), nextAt, enabled: nextAt !== null && r.enabled };
        }) }));
      },
      snooze(id) {
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, enabled: true, nextAt: Date.now() + r.snoozeMin * 60_000 } : r)) }));
      },
      setSettings(p) { set((s) => ({ settings: { ...s.settings, ...p } })); },
      importData(json) {
        try {
          const d = JSON.parse(json);
          if (!Array.isArray(d.vaults) || !Array.isArray(d.txs)) return false;
          set({ vaults: d.vaults, txs: d.txs, goals: d.goals ?? [], reminders: d.reminders ?? [], settings: { ...get().settings, ...d.settings } });
          return true;
        } catch { return false; }
      },
      reset() { set({ ...initial(), settings: { ...initial().settings, lang: get().settings.lang } }); },
    }),
    {
      name: "zad-v4", storage: createJSONStorage(() => localStorage), skipHydration: true, version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Partial<State>;
        return version < 2 && Array.isArray(state.vaults)
          ? { ...state, vaults: addEmergencyVault(state.vaults) }
          : state;
      },
    },
  ),
);

function applyTx(vaults: Vault[], tx: Tx, sign: 1 | -1): Vault[] {
  if (tx.type === "goal") return vaults; // goal deposits are reversed via goal deletion
  const dir = tx.type === "income" ? sign : -sign;
  if (tx.vaultId) return vaults.map((v) => (v.id === tx.vaultId ? { ...v, balance: r2(v.balance + dir * tx.amount) } : v));
  const total = vaults.reduce((a, v) => a + v.pct, 0) || 1;
  return vaults.map((v) => ({ ...v, balance: r2(v.balance + (dir * tx.amount * v.pct) / total) }));
}

const AR_SYM: Record<string, string> = { IQD: "د.ع", SAR: "ر.س", AED: "د.إ", KWD: "د.ك", QAR: "ر.ق", BHD: "د.ب", OMR: "ر.ع", JOD: "د.أ", EGP: "ج.م", LYD: "د.ل", TND: "د.ت", DZD: "د.ج", MAD: "د.م", SYP: "ل.س", LBP: "ل.ل", YER: "ر.ي", SDG: "ج.س" };
const FALLBACK = ["IQD","USD","EUR","SAR","AED","GBP","JPY","CNY","TRY","EGP","KWD","QAR","BHD","OMR","JOD","INR","PKR","IRR","RUB","CAD","AUD","CHF"];
export const CURRENCIES: string[] = (() => {
  try { const f = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf; if (f) return f("currency"); } catch { /* ignore */ }
  return FALLBACK;
})();
export function currencyName(code: string, lang: string) {
  try { return new Intl.DisplayNames([lang], { type: "currency" }).of(code) ?? code; } catch { return code; }
}
function curInfo(code: string, lang: string) {
  let dec = 2, sym = code;
  try {
    const nf = new Intl.NumberFormat(lang, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" });
    dec = nf.resolvedOptions().maximumFractionDigits ?? 2;
    sym = nf.formatToParts(0).find((p) => p.type === "currency")?.value ?? code;
  } catch { /* ignore */ }
  if (code === "IQD") dec = 0;
  if (lang === "ar" && AR_SYM[code]) sym = AR_SYM[code];
  return { sym, dec };
}

export function useMoney() {
  const { currency, lang } = useZad((s) => s.settings);
  const c = curInfo(currency, lang);
  const loc = lang === "ar" ? "ar-IQ" : lang;
  return (n: number) => { let s: string; try { s = new Intl.NumberFormat(loc, { maximumFractionDigits: c.dec, minimumFractionDigits: 0 }).format(n); } catch { s = String(n); } return `${s} ${c.sym}`; };
}
