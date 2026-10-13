import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Target, Wallet, Receipt } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useT, greetingKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useMoney, useZad } from "@/lib/store";
import { localDateStr } from "@/lib/reminders";
import { TxForm } from "@/components/zad/forms";
import { TxRow } from "@/components/zad/TxRow";
import { Empty, Section, vaultName } from "@/components/zad/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "زاد — نظرة مالية شاملة" },
      { name: "description", content: "تابع إجمالي رصيدك ودخلك ومصروفاتك وخزائنك وأهدافك المالية." },
      { property: "og:title", content: "زاد — نظرة مالية شاملة" },
      { property: "og:description", content: "تابع إجمالي رصيدك ودخلك ومصروفاتك وخزائنك وأهدافك المالية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useT();
  const { profile, photo } = useAuth();
  const money = useMoney();
  const { vaults, txs, goals, settings } = useZad();
  const who = profile?.display_name || settings.name;
  const [form, setForm] = useState<null | "income" | "expense">(null);
  const total = vaults.reduce((a, v) => a + v.balance, 0);

  const chart = useMemo(() => {
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return localDateStr(d); });
    const net = (tx: { type: string; amount: number }) => (tx.type === "income" ? tx.amount : tx.type === "expense" ? -tx.amount : 0);
    let run = txs.filter((x) => x.date < days[0]!).reduce((a, x) => a + net(x), 0);
    return days.map((d) => {
      run += txs.filter((x) => x.date === d).reduce((a, x) => a + net(x), 0);
      return { d: new Date(d).toLocaleDateString(lang === "ar" ? "ar-IQ" : lang, { weekday: "short" }), v: run };
    });
  }, [txs, lang]);

  const month = localDateStr().slice(0, 7);
  const mIn = txs.filter((x) => x.type === "income" && x.date.startsWith(month)).reduce((a, x) => a + x.amount, 0);
  const mOut = txs.filter((x) => x.type === "expense" && x.date.startsWith(month)).reduce((a, x) => a + x.amount, 0);

  const quick = [
    { label: t.income, icon: ArrowDownLeft, onClick: () => setForm("income") },
    { label: t.expense, icon: ArrowUpRight, onClick: () => setForm("expense") },
    { label: t.vaults, icon: Wallet, to: "/vaults" as const },
    { label: t.goals, icon: Target, to: "/goals" as const },
  ];

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gold font-display text-lg font-bold text-primary-foreground shadow-glow">{photo ? <img src={photo} alt="" referrerPolicy="no-referrer" className="size-full rounded-2xl object-cover" /> : (who || t.appName).charAt(0)}</div>
          <div>
            <p className="text-xs text-muted-foreground">{t[greetingKey()]}{who ? (lang === "ar" ? "،" : ",") : ""}</p>
            <p className="font-display font-semibold">{who || t.appName} 👋</p>
          </div>
        </div>
        <span className="font-display text-2xl font-bold text-gold">{t.appName}</span>
      </header>

      <section className="bg-hero shadow-glow relative mt-5 overflow-hidden rounded-3xl border border-primary/20 p-5">
        <div aria-hidden className="animate-shimmer absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
        <p className="text-sm text-muted-foreground">{t.total}</p>
        <p className="mt-1 font-display text-4xl font-bold tracking-tight">{money(total)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{txs.length} {t.ops}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-background/30 p-3"><p className="text-xs text-muted-foreground">{t.earned} · {t.thisMonth}</p><p className="font-display font-semibold text-success">{money(mIn)}</p></div>
          <div className="rounded-2xl bg-background/30 p-3"><p className="text-xs text-muted-foreground">{t.spent} · {t.thisMonth}</p><p className="font-display font-semibold">{money(mOut)}</p></div>
        </div>
        <div className="mt-4 h-24" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} labelStyle={{ color: "var(--muted-foreground)" }} formatter={(v: number) => [money(v), t.total]} />
              <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-4 gap-2.5">
        {quick.map((q) => {
          const inner = (
            <>
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-secondary text-primary transition group-hover:shadow-glow"><q.icon className="size-5" /></span>
              <span className="text-[11px] font-medium text-muted-foreground">{q.label}</span>
            </>
          );
          const cls = "group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-3 transition hover:-translate-y-0.5 hover:border-primary/30 active:scale-95";
          return q.to ? <Link key={q.label} to={q.to} className={cls}>{inner}</Link> : <button key={q.label} onClick={q.onClick} className={cls}>{inner}</button>;
        })}
      </div>

      <Section title={t.vaults} action={<Link to="/vaults" className="text-xs text-primary">{t.seeAll}</Link>}>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {vaults.map((v) => (
            <div key={v.id} className="min-w-36 snap-start rounded-2xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <span className="size-2.5 rounded-full" style={{ background: v.color }} />
                <span className="text-[11px] text-muted-foreground">{v.pct}%</span>
              </div>
              <p className="mt-3 truncate text-xs text-muted-foreground">{vaultName(v, t)}</p>
              <p className="font-display text-sm font-semibold">{money(v.balance)}</p>
            </div>
          ))}
        </div>
      </Section>

      {goals.length > 0 && (
        <Section title={t.goals} action={<Link to="/goals" className="text-xs text-primary">{t.seeAll}</Link>}>
          <div className="space-y-2">
            {goals.slice(0, 2).map((g) => {
              const p = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0;
              return (
                <div key={g.id} className="rounded-2xl border border-border bg-card p-3.5">
                  <div className="flex justify-between text-sm"><span className="font-medium">{g.name}</span><span className="text-muted-foreground">{Math.round(p)}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${p}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Section title={t.recent} action={<Link to="/expenses" className="text-xs text-primary">{t.seeAll}</Link>}>
        {txs.length ? <ul className="space-y-2">{txs.slice(0, 5).map((x) => <TxRow key={x.id} tx={x} />)}</ul> : <Empty icon={<Receipt className="size-5" />} text={t.noTx} />}
      </Section>

      {form && <TxForm type={form} open onOpenChange={(o) => !o && setForm(null)} />}
    </>
  );
}
