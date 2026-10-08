export type Repeat = "once" | "daily" | "weekly" | "weekdays" | "monthly" | "yearly" | "interval";
export type Unit = "minutes" | "hours" | "days" | "weeks" | "months";

export interface ReminderRule {
  date: string; // yyyy-mm-dd (local)
  time: string; // HH:mm
  repeat: Repeat;
  intervalValue: number;
  intervalUnit: Unit;
}

export function localDateStr(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function anchor(r: ReminderRule) {
  const [y = 0, m = 1, d = 1] = r.date.split("-").map(Number);
  const [hh = 0, mm = 0] = r.time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function add(d: Date, v: number, u: Unit) {
  const n = new Date(d);
  if (u === "minutes") n.setMinutes(n.getMinutes() + v);
  else if (u === "hours") n.setHours(n.getHours() + v);
  else if (u === "days") n.setDate(n.getDate() + v);
  else if (u === "weeks") n.setDate(n.getDate() + v * 7);
  else n.setMonth(n.getMonth() + v);
  return n;
}

/** Next fire time strictly after `after` (ms). Returns null if never again. */
export function computeNext(r: ReminderRule, after = Date.now()): number | null {
  const a = anchor(r);
  if (isNaN(a.getTime())) return null;
  if (a.getTime() > after) {
    if (r.repeat !== "weekdays" || isWeekday(a)) return a.getTime();
  }
  if (r.repeat === "once") return null;
  const step: [number, Unit] =
    r.repeat === "daily" || r.repeat === "weekdays" ? [1, "days"]
    : r.repeat === "weekly" ? [1, "weeks"]
    : r.repeat === "monthly" ? [1, "months"]
    : r.repeat === "yearly" ? [12, "months"]
    : [Math.max(1, r.intervalValue || 1), r.intervalUnit];
  let c = a;
  // fast-forward for small units
  if (step[1] === "minutes" || step[1] === "hours") {
    const ms = step[0] * (step[1] === "minutes" ? 60_000 : 3_600_000);
    const k = Math.max(0, Math.floor((after - a.getTime()) / ms));
    c = new Date(a.getTime() + k * ms);
  }
  for (let i = 0; i < 5000; i++) {
    if (c.getTime() > after && (r.repeat !== "weekdays" || isWeekday(c))) return c.getTime();
    c = add(c, step[0], step[1]);
  }
  return null;
}

const isWeekday = (d: Date) => d.getDay() !== 5 && d.getDay() !== 6; // Fri/Sat weekend

let ctx: AudioContext | null = null;
export function playTone(kind: string) {
  try {
    ctx ??= new AudioContext();
    const pattern: Record<string, [number, number][]> = {
      default: [[880, 0], [1100, 0.18], [880, 0.36]],
      gentle: [[523, 0], [659, 0.3], [784, 0.6]],
      urgent: [[1200, 0], [1200, 0.12], [1200, 0.24], [1200, 0.36], [1200, 0.48]],
      bell: [[1318, 0], [988, 0.4]],
    };
    for (const [f, t] of pattern[kind] ?? pattern["default"] ?? []) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.type = kind === "urgent" ? "square" : "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + (kind === "bell" ? 0.8 : 0.16));
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 1);
    }
  } catch { /* audio unavailable */ }
}
