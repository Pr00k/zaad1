import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Modal, inputCls } from "./ui";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface PickItem { value: string; label: string; sub?: string }

export function Picker({ open, onOpenChange, title, items, value, onPick }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; items: PickItem[]; value: string; onPick: (v: string) => void;
}) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => `${i.value} ${i.label} ${i.sub ?? ""}`.toLowerCase().includes(s)) : items;
  }, [q, items]);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className={inputCls} />
      <ul className="mt-3 max-h-[55dvh] space-y-1 overflow-y-auto">
        {list.map((i) => (
          <li key={i.value}>
            <button
              onClick={() => { onPick(i.value); onOpenChange(false); setQ(""); }}
              className={cn("flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start transition hover:bg-accent", i.value === value && "bg-accent text-primary")}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{i.label}</span>
                {i.sub && <span className="block truncate text-xs text-muted-foreground">{i.sub}</span>}
              </span>
              {i.value === value && <Check className="size-4 shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
