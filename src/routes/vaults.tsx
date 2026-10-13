import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useMoney, useZad, type Vault } from "@/lib/store";
import { Empty, Field, Modal, PageTitle, inputCls, vaultName } from "@/components/zad/ui";

export const Route = createFileRoute("/vaults")({
  head: () => ({
    meta: [
      { title: "زاد — الخزائن" },
      { name: "description", content: "إدارة خزائنك ونسب توزيع الدخل عليها." },
      { property: "og:title", content: "زاد — الخزائن" },
      { property: "og:description", content: "إدارة خزائنك ونسب توزيع الدخل عليها." },
    ],
  }),
  component: Page,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];

function Page() {
  const { t } = useT();
  const money = useMoney();
  const { vaults, saveVault, deleteVault, setPcts } = useZad();
  const [editing, setEditing] = useState<Partial<Vault> | null>(null);
  const [pcts, setLocalPcts] = useState<Record<string, number> | null>(null);

  const sum = vaults.reduce((a, v) => a + v.pct, 0);
  const draftSum = pcts ? Object.values(pcts).reduce((a, n) => a + (n || 0), 0) : sum;

  const normalize = () => {
    const total = Object.values(pcts ?? {}).reduce((a, n) => a + (n || 0), 0) || 1;
    const next: Record<string, number> = {};
    for (const v of vaults) next[v.id] = Math.round(((pcts?.[v.id] ?? v.pct) / total) * 100);
    const diff = 100 - Object.values(next).reduce((a, n) => a + n, 0);
    const first = vaults[0];
    if (first) next[first.id] = (next[first.id] ?? 0) + diff;
    setLocalPcts(next);
  };

  const savePcts = () => {
    if (!pcts) return;
    if (draftSum !== 100) { toast.error(t.mustBe100); return; }
    setPcts(pcts);
    setLocalPcts(null);
    toast.success(t.done);
  };

  return (
    <>
      <PageTitle title={t.vaults} action={
        <Button variant="gold" size="sm" onClick={() => setEditing({ color: COLORS[vaults.length % COLORS.length] ?? "var(--chart-1)" })}>
          <Plus className="size-4" /> {t.addVault}
        </Button>
      } />

      <div className="mt-4 space-y-2.5">
        {vaults.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
            <span className="size-3 shrink-0 rounded-full" style={{ background: v.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{vaultName(v, t)}</p>
              <p className="text-xs text-muted-foreground">{v.pct}% · {money(v.balance)}</p>
            </div>
            <button aria-label={t.edit} onClick={() => setEditing(v)} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <Pencil className="size-4" />
            </button>
            {vaults.length > 1 && (
              <button aria-label={t.delete} onClick={() => { deleteVault(v.id); toast.success(t.deleted); }} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <section className="mt-7 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">{t.pct}</h2>
          <span className={draftSum === 100 ? "text-sm text-success" : "text-sm text-destructive"}>{t.pctSum}: {draftSum}%</span>
        </div>
        <div className="mt-3 space-y-3">
          {vaults.map((v) => (
            <div key={v.id} className="flex items-center gap-3">
              <span className="w-24 truncate text-xs text-muted-foreground">{vaultName(v, t)}</span>
              <input
                type="range" min={0} max={100} value={pcts?.[v.id] ?? v.pct}
                onChange={(e) => setLocalPcts((p) => ({ ...(p ?? Object.fromEntries(vaults.map((x) => [x.id, x.pct]))), [v.id]: Number(e.target.value) }))}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="w-10 text-end font-display text-sm">{pcts?.[v.id] ?? v.pct}%</span>
            </div>
          ))}
        </div>
        {pcts && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="soft" onClick={normalize}>{t.normalize}</Button>
            <Button variant="gold" onClick={savePcts}>{t.save}</Button>
          </div>
        )}
      </section>

      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? t.edit : t.addVault}>
        {editing && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveVault(editing);
              setEditing(null);
              toast.success(t.done);
            }}
          >
            <Field label={t.name}>
              <input autoFocus value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} maxLength={40} required />
            </Field>
            <Field label={t.pct}>
              <input type="number" min={0} max={100} value={editing.pct ?? 0} onChange={(e) => setEditing({ ...editing, pct: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label={t.color}>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c} type="button" aria-label={c}
                    onClick={() => setEditing({ ...editing, color: c })}
                    className={editing.color === c ? "size-9 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background" : "size-9 rounded-full"}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
            <Button type="submit" variant="gold" size="lg">{t.save}</Button>
          </form>
        )}
      </Modal>

      {vaults.length === 0 && <Empty icon={<Wallet className="size-5" />} text={t.noVaults} />}
    </>
  );
}
