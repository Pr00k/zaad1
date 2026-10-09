import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT, dicts, type Lang } from "@/lib/i18n";
import { CURRENCIES, useZad, type Currency } from "@/lib/store";
import { Field, Modal, PageTitle, inputCls } from "@/components/zad/ui";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "زاد — الإعدادات" },
      { name: "description", content: "الاسم، العملة، اللغة، والنسخ الاحتياطي لبياناتك." },
      { property: "og:title", content: "زاد — الإعدادات" },
      { property: "og:description", content: "الاسم، العملة، اللغة، والنسخ الاحتياطي لبياناتك." },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = useT();
  const { settings, setSettings, importData, reset } = useZad();
  const state = useZad();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    const data = JSON.stringify({ vaults: state.vaults, txs: state.txs, goals: state.goals, reminders: state.reminders, settings: state.settings }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `zad-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.done);
  };

  const onImport = async (file: File) => {
    const ok = importData(await file.text());
    ok ? toast.success(t.done) : toast.error(t.invalidAmount);
  };

  return (
    <>
      <PageTitle title={t.settings} />

      <div className="mt-4 space-y-3">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <Field label={t.yourName}>
            <input value={settings.name} onChange={(e) => setSettings({ name: e.target.value })} className={inputCls} maxLength={40} />
          </Field>
          <Field label={t.currency}>
            <select value={settings.currency} onChange={(e) => setSettings({ currency: e.target.value as Currency })} className={inputCls}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={t.language}>
            <select value={settings.lang} onChange={(e) => setSettings({ lang: e.target.value as Lang })} className={inputCls}>
              {(Object.keys(dicts) as Lang[]).map((l) => <option key={l} value={l}>{l === "ar" ? "العربية" : "English"}</option>)}
            </select>
          </Field>
        </section>

        <section className="space-y-2.5 rounded-2xl border border-border bg-card p-4">
          <Button variant="soft" className="w-full justify-start" onClick={exportJson}>
            <Download className="size-4" /> {t.export}
          </Button>
          <Button variant="soft" className="w-full justify-start" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> {t.import}
          </Button>
          <input
            ref={fileRef} type="file" accept="application/json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onImport(f); e.target.value = ""; }}
          />
          <Button variant="soft" className="w-full justify-start text-destructive" onClick={() => setConfirmReset(true)}>
            <Trash2 className="size-4" /> {t.reset}
          </Button>
        </section>
      </div>

      <Modal open={confirmReset} onOpenChange={setConfirmReset} title={t.reset}>
        <p className="text-sm text-muted-foreground">{t.resetConfirm}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="soft" onClick={() => setConfirmReset(false)}>{t.cancel}</Button>
          <Button variant="destructive" onClick={() => { reset(); setConfirmReset(false); toast.success(t.done); }}>{t.reset}</Button>
        </div>
      </Modal>
    </>
  );
}
