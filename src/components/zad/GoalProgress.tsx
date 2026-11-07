import { Check } from "lucide-react";

export function GoalProgress({ percent, done }: { percent: number; done: boolean }) {
  const circumference = 2 * Math.PI * 25;
  return <span className="relative grid size-14 shrink-0 place-items-center" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
    <svg viewBox="0 0 56 56" className="absolute inset-0 size-14 -rotate-90" aria-hidden="true">
      <circle cx="28" cy="28" r="25" fill="none" stroke="var(--secondary)" strokeWidth="3" />
      <circle className="progress-arc" cx="28" cy="28" r="25" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} />
    </svg>
    {done ? <span className="animate-completed grid size-[22px] place-items-center rounded-full bg-success text-background"><Check className="draw-check size-3" strokeWidth={3} /></span> : <span key={Math.round(percent)} className="progress-value font-display text-[13px] font-bold">{Math.round(percent)}%</span>}
  </span>;
}