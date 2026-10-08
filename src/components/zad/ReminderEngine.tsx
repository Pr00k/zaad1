import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useZad, type Reminder } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { playTone } from "@/lib/reminders";
import { Modal } from "./ui";

/** Checks due reminders every few seconds, also catches up after the tab was asleep. */
export function ReminderEngine() {
  const { t } = useT();
  const [queue, setQueue] = useState<Reminder[]>([]);
  const markFired = useZad((s) => s.markFired);
  const snooze = useZad((s) => s.snooze);
  const goals = useZad((s) => s.goals);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const due = useZad.getState().reminders.filter((r) => r.enabled && r.nextAt && r.nextAt <= now);
      if (!due.length) return;
      due.forEach((r) => {
        markFired(r.id);
        playTone(r.sound);
        if (r.vibrate && "vibrate" in navigator) navigator.vibrate?.([300, 120, 300]);
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification(t.appName, { body: r.title, tag: r.id }); } catch { /* some browsers need SW */ }
        }
      });
      setQueue((q) => [...q, ...due]);
    };
    tick();
    const id = setInterval(tick, 5000);
    const vis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [markFired, t.appName]);

  const cur = queue[0];
  const close = () => setQueue((q) => q.slice(1));
  const goal = cur?.goalId ? goals.find((g) => g.id === cur.goalId) : null;

  return (
    <Modal open={!!cur} onOpenChange={(o) => !o && close()} title={t.reminders}>
      {cur && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-gold text-primary-foreground shadow-glow">
            <BellRing className="animate-ring size-9" />
          </div>
          <p className="font-display text-4xl font-bold text-gold">{cur.time}</p>
          <p className="text-lg">{cur.title}</p>
          {goal && <p className="text-sm text-muted-foreground">🎯 {goal.name}</p>}
          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="soft" size="lg" onClick={() => { snooze(cur.id); close(); }}>{t.snooze} {cur.snoozeMin}{t.min}</Button>
            <Button variant="gold" size="lg" onClick={close}>{t.done}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
