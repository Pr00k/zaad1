import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import type { Vault } from "@/lib/store";
import { cn } from "@/lib/utils";

export function vaultName(v: Vault | undefined, t: Record<string, unknown>) {
  if (!v) return "—";
  return v.name || (v.key ? (t[v.key] as string) : "") || "—";
}

export function Modal({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; children: ReactNode }) {
  const { dir } = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir} className="max-h-[90dvh] overflow-y-auto rounded-3xl border-border bg-popover sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "h-12 w-full rounded-xl border border-input bg-secondary px-3.5 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-muted-foreground">
      <div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function PageTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      {action}
    </div>
  );
}
