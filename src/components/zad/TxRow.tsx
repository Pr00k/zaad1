import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useMoney, useZad, type Tx } from "@/lib/store";
import { cn } from "@/lib/utils";
import { vaultName } from "./ui";

export function TxRow({ tx }: { tx: Tx }) {
  const { t, lang } = useT();
  const money = useMoney();
  const vault = useZad((s) => s.vaults.find((v) => v.id === tx.vaultId));
  const del = useZad((s) => s.deleteTx);
  const restore = useZad((s) => s.restoreTx);
  const [eating, setEating] = useState(false);
  const Icon = tx.type === "income" ? ArrowDownLeft : tx.type === "goal" ? Target : ArrowUpRight;
  const label = tx.note || (tx.type === "income" ? t.income : tx.type === "goal" ? t.contribute : t.expense);

  const remove = () => {
    setEating(true);
    setTimeout(() => {
      const removed = del(tx.id);
      if (removed) toast(t.deleted, { action: { label: t.undo, onClick: () => restore(removed) } });
    }, 420);
  };

  return (
    <li className={cn("group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/30", eating && "animate-eat")}>
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tx.type === "income" ? "bg-success/15 text-success" : tx.type === "goal" ? "bg-accent text-primary" : "bg-destructive/15 text-destructive")}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {tx.vaultId ? vaultName(vault, t) : t.splitAuto.split(" ").slice(0, 2).join(" ")} · {new Date(tx.date).toLocaleDateString(lang === "ar" ? "ar-IQ" : lang, { day: "numeric", month: "short" })}
        </p>
      </div>
      <span className={cn("font-display text-sm font-semibold", tx.type === "income" ? "text-success" : "text-foreground")}>
        {tx.type === "income" ? "+" : "−"}{money(tx.amount)}
      </span>
      {tx.type !== "goal" && (
        <button onClick={remove} aria-label={t.delete} className="grid size-8 place-items-center rounded-lg text-muted-foreground opacity-60 transition hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100">
          <Trash2 className="size-4" />
        </button>
      )}
    </li>
  );
}
