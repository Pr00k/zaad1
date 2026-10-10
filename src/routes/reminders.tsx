import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, BellRing, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/lib/i18n";
import { useZad, type Reminder } from "@/lib/store";
import { localDateStr, type Repeat, type Unit } from "@/lib/reminders";
import { Empty, Field, Modal, PageTitle, inputCls } from "@/components/zad/ui";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "زاد — التذكيرات" },
      { name: "description", content: "تذكيراتك بمواعيد المهام والأهداف مع صوت واهتزاز." },
      { property: "og:title", content: "زاد — التذكيرات" },
      { property: "og:description", content: "تذكيراتك بمواعيد المهام والأهداف مع صوت واهتزاز." },
    ],
  }),
  component: Page,
});

const REPEATS: Repeat[] = ["once", "daily", "weekly", "weekdays", "monthly", "yearly", "interval"];
const UNITS: Unit[] = ["minutes", "hours", "days", "weeks", "months"];
const SOUNDS = ["default", "gentle", "urgent", "bell"];

function Page() {
  const { t, lang } = useT();
  const { reminders, goals, saveReminder, deleteReminder, toggleReminder } = useZad();
  const [editing, setEditing] = useState<Partial<Reminder> | null>(null);
  const [notif, setNotif] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");

  const askNotif = async () => {
    try {
      const p = await Notification.requestPermission();
      setNotif(p);
      toast.success(p === "granted" ? t.notifOn : t.notifOff);
    } catch { toast.error(t.notifOff); }
  };

  const repeatLabel = (r: Reminder) =>
    r.repeat === "interval" ? `${t.every} ${r.intervalValue} ${t[r.intervalUnit]}` : t[r.repeat];

  return (
    <>
      <PageTitle title={t.reminders} action={
        <Button variant="gold" size="sm" onClick={() => setEditing({ date: localDateStr(), time: "09:00", repeat: "once", intervalValue: 1, intervalUnit: "hours", sound: "default", snoozeMin: 10, vibrate: true, goalId: null })}>
          <Plus className="size-4" /> {t.addReminder}
        </Button>
      } />

      {notif !== "granted" && (
        <button onClick={askNotif} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-accent p-3.5 text-start transition hover:border-primary">
          <BellRing className="size-5 shrink-0 text-primary" />
          <span className="text-sm">{t.notifPerm}</span>
        </button>
      )}

      <div className="mt-4 space-y-2.5">
        {reminders.map((r) => {
          const goal = r.goalId ? goals.find((g) => g.id === r.goalId) : null;
          return (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
              <span className={r.enabled ? "grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary" : "grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground"}>
                <Bell className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.time} · {repeatLabel(r)}
                  {goal && <> · 🎯 {goal.name}</>}
                  {r.nextAt && <> · {t.next}: {new Date(r.nextAt).toLocaleDateString(lang === "ar" ? "ar-IQ" : lang, { day: "numeric", month: "short" })}</>}
                </p>
              </div>
              <Switch checked={r.enabled} onCheckedChange={() => toggleReminder(r.id)} aria-label={t.enabled} />
              <button aria-label={t.edit} onClick={() => setEditing(r)} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                <Pencil className="size-4" />
              </button>
              <button aria-label={t.delete} onClick={() => { deleteReminder(r.id); toast.success(t.deleted); }} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </div>

      {reminders.length === 0 && <Empty icon={<Bell className="size-5" />} text={t.noReminders} />}

      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? t.edit : t.addReminder}>
        {editing && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveReminder(editing);
              setEditing(null);
              toast.success(t.done);
            }}
          >
            <Field label={t.name}>
              <input autoFocus value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} maxLength={80} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.date}>
                <input type="date" value={editing.date ?? ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className={inputCls} required />
              </Field>
              <Field label={t.time}>
                <input type="time" value={editing.time ?? "09:00"} onChange={(e) => setEditing({ ...editing, time: e.target.value })} className={inputCls} required />
              </Field>
            </div>
            <Field label={t.repeat}>
              <select value={editing.repeat ?? "once"} onChange={(e) => setEditing({ ...editing, repeat: e.target.value as Repeat })} className={inputCls}>
                {REPEATS.map((r) => <option key={r} value={r}>{t[r]}</option>)}
              </select>
            </Field>
            {editing.repeat === "interval" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label={t.every}>
                  <input type="number" min={1} value={editing.intervalValue ?? 1} onChange={(e) => setEditing({ ...editing, intervalValue: Math.max(1, Number(e.target.value)) })} className={inputCls} />
                </Field>
                <Field label={t.repeat}>
                  <select value={editing.intervalUnit ?? "hours"} onChange={(e) => setEditing({ ...editing, intervalUnit: e.target.value as Unit })} className={inputCls}>
                    {UNITS.map((u) => <option key={u} value={u}>{t[u]}</option>)}
                  </select>
                </Field>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.sound}>
                <select value={editing.sound ?? "default"} onChange={(e) => setEditing({ ...editing, sound: e.target.value })} className={inputCls}>
                  {SOUNDS.map((s) => <option key={s} value={s}>{t.sounds[s as keyof typeof t.sounds]}</option>)}
                </select>
              </Field>
              <Field label={`${t.snooze} (${t.min})`}>
                <input type="number" min={1} max={120} value={editing.snoozeMin ?? 10} onChange={(e) => setEditing({ ...editing, snoozeMin: Math.max(1, Number(e.target.value)) })} className={inputCls} />
              </Field>
            </div>
            <Field label={t.linkedGoal}>
              <select value={editing.goalId ?? ""} onChange={(e) => setEditing({ ...editing, goalId: e.target.value || null })} className={inputCls}>
                <option value="">{t.none}</option>
                {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <label className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
              <span className="text-sm">{t.vibrate}</span>
              <Switch checked={editing.vibrate ?? true} onCheckedChange={(v) => setEditing({ ...editing, vibrate: v })} />
            </label>
            <Button type="submit" variant="gold" size="lg">{t.save}</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
