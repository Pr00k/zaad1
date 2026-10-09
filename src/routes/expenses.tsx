import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useZad } from "@/lib/store";
import { TxForm } from "@/components/zad/forms";
import { TxRow } from "@/components/zad/TxRow";
import { Empty, PageTitle, inputCls } from "@/components/zad/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "زاد — العمليات" },
      { name: "description", content: "كل عمليات الدخل والمصروف مع بحث وتصفية." },
      { property: "og:title", content: "زاد — العمليات" },
      { property: "og:description", content: "كل عمليات الدخل والمصروف مع بحث وتصفية." },
    ],
  }),
  component: Page,
});

type Filter = "all" | "income" | "expense" | "goal";

function Page() {
  const { t } = useT();
  const txs = useZad((s) => s.txs);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState<null | "income" | "expense">(null);

  const list = useMemo(
    () => txs.filter((x) => (filter === "all" || x.type === filter) && (!q || x.note.toLowerCase().includes(q.toLowerCase()))),
    [txs, q, filter],
  );

  const tabs: { k: Filter; label: string }[] = [
    { k: "all", label: t.all },
    { k: "income", label: t.income },
    { k: "expense", label: t.expense },
    { k: "goal", label: t.goals },
  ];

  return (
    <>
      <PageTitle title={t.recent} />

      <div className="mt-4 flex gap-2">
        <Button variant="gold" size="sm" className="flex-1" onClick={() => setForm("income")}>
          <ArrowDownLeft className="size-4" /> {t.addIncome}
        </Button>
        <Button variant="soft" size="sm" className="flex-1" onClick={() => setForm("expense")}>
          <ArrowUpRight className="size-4" /> {t.addExpense}
        </Button>
      </div>

      <div className="relative mt-4">
        <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={cn(inputCls, "ps-10")} />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.k}
            onClick={() => setFilter(tab.k)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition",
              filter === tab.k ? "border-primary bg-accent text-primary" : "border-border bg-card text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {list.length ? (
          <ul className="space-y-2">{list.map((x) => <TxRow key={x.id} tx={x} />)}</ul>
        ) : (
          <Empty icon={<Receipt className="size-5" />} text={t.noTx} />
        )}
      </div>

      {form && <TxForm type={form} open onOpenChange={(o) => !o && setForm(null)} />}
    </>
  );
}
