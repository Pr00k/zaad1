import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useMoney, useZad, type Goal } from "@/lib/store";
import { localDateStr } from "@/lib/reminders";
import { Empty, Field, Modal, PageTitle, inputCls, vaultName } from "@/components/zad/ui";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "زاد — الأهداف" },
      { name: "description", content: "أهدافك المالية وتقدمك نحوها." },
      { property: "og:title", content: "زاد — الأهداف" },
      { property: "og:description", content: "أهدافك المالية وتقدمك نحوها." },
    ],
  }),
  component: Page,
});

function Page() {
  const { t, lang } = useT();
  const money = useMoney();
  const { goals, vaults, saveGoal, deleteGoal, contribute } = useZad();
  const [editing, setEditing] = useState<Partial<Goal> | null>(null);
  const [deposit, setDeposit] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit) return;
    const n = Number(amount.replace(/[^\d.]/g, ""));
    const res = contribute(deposit.id, n);
    if (!res.ok) { toast.error(t[res.error]); return; }
    toast.success(t.added);
    setAmount("");
    setDeposit(null);
  };

  return (
    <>
      <PageTitle title={t.goals} action={
        <Button variant="gold" size="sm" onClick={() => setEditing({ deadline: localDateStr(), vaultId: vaults[0]?.id ?? "" })}>
          <Plus className="size-4" /> {t.addGoal}
        </Button>
      } />

      <div className="mt-4 space-y-3">
        {goals.map((g) => {
          const p = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0;
          const done = g.target > 0 && g.saved >= g.target;
          const vault = vaults.find((v) => v.id === g.vaultId);
          return (
            <div key={g.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{g.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.fundedFrom}: {vaultName(vault, t)}
                    {g.deadline && <> · {new Date(g.deadline).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button aria-label={t.edit} onClick={() => setEditing(g)} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                    <Pencil className="size-4" />
                  </button>
                  <button aria-label={t.delete} onClick={() => { deleteGoal(g.id); toast.success(t.deleted); }} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-lg font-semibold">{money(g.saved)} <span className="text-xs font-normal text-muted-foreground">/ {money(g.target)}</span></p>
                <span className="text-sm text-muted-foreground">{Math.round(p)}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${p}%` }} />
              </div>
              {done ? (
                <p className="mt-3 text-center text-sm font-medium text-success">{t.reached}</p>
              ) : (
                <Button variant="soft" size="sm" className="mt-3 w-full" onClick={() => setDeposit(g)}>
                  <Target className="size-4" /> {t.contribute} · {t.left}: {money(Math.max(0, g.target - g.saved))}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && <Empty icon={<Target className="size-5" />} text={t.noGoals} />}

      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? t.edit : t.addGoal}>
        {editing && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!(Number(editing.target) > 0)) { toast.error(t.invalidAmount); return; }
              saveGoal({ ...editing, target: Number(editing.target) });
              setEditing(null);
              toast.success(t.done);
            }}
          >
            <Field label={t.name}>
              <input autoFocus value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} maxLength={60} required />
            </Field>
            <Field label={t.target}>
              <input inputMode="decimal" value={editing.target ?? ""} onChange={(e) => setEditing({ ...editing, target: Number(e.target.value.replace(/[^\d.]/g, "")) })} className={inputCls} placeholder="0" required />
            </Field>
            <Field label={t.deadline}>
              <input type="date" value={editing.deadline ?? ""} onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} className={inputCls} />
            </Field>
            <Field label={t.fundedFrom}>
              <select value={editing.vaultId ?? ""} onChange={(e) => setEditing({ ...editing, vaultId: e.target.value })} className={inputCls}>
                {vaults.map((v) => <option key={v.id} value={v.id}>{vaultName(v, t)} — {money(v.balance)}</option>)}
              </select>
            </Field>
            <Button type="submit" variant="gold" size="lg">{t.save}</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!deposit} onOpenChange={(o) => !o && setDeposit(null)} title={t.contribute}>
        {deposit && (
          <form onSubmit={submitDeposit} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{deposit.name} · {t.saved}: {money(deposit.saved)}</p>
            <Field label={t.amount}>
              <input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputCls} h-14 font-display text-2xl`} placeholder="0" />
            </Field>
            <Button type="submit" variant="gold" size="lg">{t.add}</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
