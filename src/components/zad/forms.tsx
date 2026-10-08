import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useMoney, useZad } from "@/lib/store";
import { localDateStr } from "@/lib/reminders";
import { Field, Modal, inputCls, vaultName } from "./ui";

export function TxForm({ type, open, onOpenChange }: { type: "income" | "expense"; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useT();
  const money = useMoney();
  const vaults = useZad((s) => s.vaults);
  const addIncome = useZad((s) => s.addIncome);
  const addExpense = useZad((s) => s.addExpense);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(localDateStr());
  const [vaultId, setVaultId] = useState<string>(type === "income" ? "auto" : vaults[0]?.id ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount.replace(/[^\d.]/g, ""));
    const res = type === "income" ? addIncome(n, note.trim(), date, vaultId === "auto" ? null : vaultId) : addExpense(n, note.trim(), date, vaultId);
    if (!res.ok) { toast.error(t[res.error]); return; }
    toast.success(t.added);
    setAmount(""); setNote("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={type === "income" ? t.addIncome : t.addExpense}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t.amount}>
          <input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputCls} h-14 font-display text-2xl`} placeholder="0" />
        </Field>
        <Field label={t.vault}>
          <select value={vaultId} onChange={(e) => setVaultId(e.target.value)} className={inputCls}>
            {type === "income" && <option value="auto">{t.splitAuto}</option>}
            {vaults.map((v) => (
              <option key={v.id} value={v.id}>{vaultName(v, t)} — {money(v.balance)}</option>
            ))}
          </select>
        </Field>
        <Field label={t.note}>
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} maxLength={80} />
        </Field>
        <Field label={t.date}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Button type="submit" variant="gold" size="lg">{t.add}</Button>
      </form>
    </Modal>
  );
}
