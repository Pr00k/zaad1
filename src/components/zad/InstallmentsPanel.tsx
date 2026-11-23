import { useEffect, useState } from "react";
import { Bell, CalendarDays, CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useMoney, useZad, type Installment } from "@/lib/store";
import { installmentDueDate, nextInstallmentIndex } from "@/lib/installments";
import { localDateStr } from "@/lib/reminders";
import { Empty, Field, Modal, inputCls, vaultName } from "./ui";

export function InstallmentsPanel() {
  const { t, lang } = useT();
  const money = useMoney();
  const { installments, vaults, saveInstallment, payInstallment, deleteInstallment } = useZad();
  const [editing, setEditing] = useState<Partial<Installment> | null>(null);
  const [paying, setPaying] = useState<{ id: string; index: number } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [date, setDate] = useState(localDateStr());
  const [source, setSource] = useState("all");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  useEffect(() => { if ("Notification" in window) setPermission(Notification.permission); }, []);
  const formatDate = (d: Date) => d.toLocaleDateString(lang === "ar" ? "ar-IQ" : lang, { day: "numeric", month: "short", year: "numeric" });
  const active = installments.find((p) => p.id === paying?.id);
  const locked = Boolean(editing?.payments?.length);
  const vaultOptions = <>
    <option value="all">{t.allVaults} — {money(vaults.reduce((sum, v) => sum + v.balance, 0))}</option>
    {vaults.map((v) => <option key={v.id} value={v.id}>{vaultName(v, t)} — {money(v.balance)}</option>)}
  </>;

  const askPermission = async () => {
    try {
      if (!("Notification" in window)) { toast.error(t.notifOff); return; }
      const result = await Notification.requestPermission();
      setPermission(result);
      toast(result === "granted" ? t.notifOn : t.notifOff);
    } catch { toast.error(t.notifOff); }
  };

  return <section className="mt-5 min-w-0">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><CreditCard className="size-5 text-primary" />{t.installments}</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={askPermission} disabled={permission === "granted"}><Bell className="size-4" />{permission === "granted" ? t.notifOn : t.notifPerm}</Button>
        <Button variant="gold" size="sm" onClick={() => setEditing({ name: "", amount: 0, months: 12, firstMonth: localDateStr().slice(0, 7), dueDay: new Date().getDate(), reminderDays: 3, vaultId: "all" })}><Plus className="size-4" />{t.newInstallment}</Button>
      </div>
    </div>
    <div className="space-y-3">
      {installments.map((plan) => {
        const index = nextInstallmentIndex(plan);
        const due = index === null ? null : installmentDueDate(plan, index);
        const paid = plan.payments.reduce((sum, p) => sum + p.amount, 0);
        const total = Math.round(plan.amount * plan.months * 100) / 100;
        return <article key={plan.id} className="motion-card animate-enter rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="break-words font-medium">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{money(plan.amount)} · {t.monthly}</p>
              <p className="mt-1 break-words text-xs text-muted-foreground">{t.spendingFrom}: {plan.vaultId === "all" ? t.allVaults : vaultName(vaults.find((v) => v.id === plan.vaultId), t)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" title={t.edit} aria-label={`${t.edit} ${plan.name}`} className="size-8" onClick={() => setEditing(plan)}><Pencil className="size-4" /></Button>
              <Button variant="ghost" size="icon" title={t.delete} aria-label={`${t.delete} ${plan.name}`} className="size-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleting(plan.id)}><Trash2 className="size-4" /></Button>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
            <div><dt className="text-xs text-muted-foreground">{t.paidInstallments}</dt><dd className="mt-1 font-semibold">{plan.payments.length} / {plan.months}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t.totalCommitment}</dt><dd className="mt-1 break-words font-semibold">{money(total)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t.left}</dt><dd className="mt-1 break-words font-semibold">{money(Math.max(0, Math.round((total - paid) * 100) / 100))}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t.next}</dt><dd className="mt-1">{due ? formatDate(due) : "—"}</dd></div>
          </dl>
          {due && <p className="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{t.remindBeforeDays}: {plan.reminderDays}{localDateStr(due) < localDateStr() && <span className="text-destructive"> · {t.overdue}</span>}</p>}
          {index === null ? <p className="mt-4 text-center text-sm font-medium text-success">{t.installmentComplete}</p> : <Button variant="soft" size="sm" className="mt-4 w-full" onClick={() => { setDate(localDateStr()); setSource(plan.vaultId); setPaying({ id: plan.id, index }); }}><CreditCard className="size-4" />{t.payInstallment} · {money(plan.amount)}</Button>}
          {plan.payments.length > 0 && <details className="mt-3 border-t border-border pt-3 text-sm"><summary className="cursor-pointer text-muted-foreground">{t.paymentHistory}</summary><ol className="mt-2 space-y-2">{[...plan.payments].sort((a, b) => a.index - b.index).map((p) => <li key={p.txId} className="flex flex-wrap justify-between gap-2"><span>{p.index + 1} · {p.date}</span><span className="font-medium text-success">{money(p.amount)}</span></li>)}</ol></details>}
        </article>;
      })}
    </div>
    {installments.length === 0 && <Empty icon={<CreditCard className="size-5" />} text={t.noInstallments} />}

    <Modal open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }} title={editing?.id ? t.edit : t.newInstallment}>
      {editing && <form className="flex flex-col gap-4" onSubmit={(event) => {
        event.preventDefault();
        const result = saveInstallment(editing);
        if (!result.ok) { toast.error(t[result.error]); return; }
        toast.success(t.done); setEditing(null);
      }}>
        <Field label={t.name}><input autoFocus required maxLength={60} value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
        <Field label={t.monthlyAmount}><input type="number" inputMode="decimal" required min="0.01" step="0.01" disabled={locked} value={editing.amount || ""} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label={t.paymentMonths}><input type="number" inputMode="numeric" required min="1" step="1" disabled={locked} value={editing.months ?? ""} onChange={(e) => setEditing({ ...editing, months: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label={t.firstPaymentMonth}><input type="month" required disabled={locked} value={editing.firstMonth ?? ""} onChange={(e) => setEditing({ ...editing, firstMonth: e.target.value })} className={inputCls} /></Field>
        <Field label={t.paymentDay}><input type="number" inputMode="numeric" required min="1" max="31" step="1" disabled={locked} value={editing.dueDay ?? ""} onChange={(e) => setEditing({ ...editing, dueDay: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label={t.remindBeforeDays}><input type="number" inputMode="numeric" required min="0" step="1" value={editing.reminderDays ?? ""} onChange={(e) => setEditing({ ...editing, reminderDays: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label={t.spendingFrom}><select value={editing.vaultId ?? "all"} onChange={(e) => setEditing({ ...editing, vaultId: e.target.value })} className={inputCls}>{vaultOptions}</select></Field>
        <Button type="submit" variant="gold" size="lg">{t.save}</Button>
      </form>}
    </Modal>
    <Modal open={paying !== null && Boolean(active)} onOpenChange={(open) => { if (!open) setPaying(null); }} title={t.payInstallment}>
      {active && paying && <form className="flex flex-col gap-4" onSubmit={(event) => {
        event.preventDefault();
        const result = payInstallment(active.id, paying.index, date, source);
        if (!result.ok) { toast.error(t[result.error]); return; }
        toast.success(t.installmentPaid); setPaying(null);
      }}>
        <p className="break-words font-medium">{active.name}</p>
        <p className="font-display text-2xl font-semibold text-primary">{money(active.amount)}</p>
        <p className="text-sm text-muted-foreground">{t.installmentDue}: {formatDate(installmentDueDate(active, paying.index))}</p>
        <Field label={t.date}><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
        <Field label={t.spendingFrom}><select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>{vaultOptions}</select></Field>
        <Button type="submit" variant="gold" size="lg"><CreditCard className="size-4" />{t.confirmPayment}</Button>
      </form>}
    </Modal>
    <Modal open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }} title={t.delete}>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.deleteInstallmentConfirm}</p>
      <div className="mt-4 flex justify-end gap-2"><Button variant="soft" onClick={() => setDeleting(null)}>{t.cancel}</Button><Button variant="destructive" onClick={() => { if (deleting) deleteInstallment(deleting); setDeleting(null); toast.success(t.deleted); }}>{t.delete}</Button></div>
    </Modal>
  </section>;
}