import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ChevronLeft, Coins, Download, Globe, LogOut, Trash2, Upload, User as UserIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Picker } from "@/components/zad/Picker";
import { useAuth, fileToAvatar } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT, LANG_CODES, langName, nativeName } from "@/lib/i18n";
import { CURRENCIES, currencyName, useZad } from "@/lib/store";
import { Modal, PageTitle, inputCls } from "@/components/zad/ui";

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
  const [langOpen, setLangOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);
  const { lang } = useT();
  const { user, profile, photo, hasGoogle, updateProfile, signOut } = useAuth();
  const photoRef = useRef<HTMLInputElement>(null);
  const onPhoto = async (f: File) => {
    if (!f.type.startsWith("image/") || f.size > 10 * 1024 * 1024) return;
    const url = await fileToAvatar(f);
    (await updateProfile({ avatar_url: url, use_google_avatar: false })) ? toast.success(t.done) : toast.error(t.authError);
  };
  const langItems = useMemo(() => LANG_CODES.map((c) => ({ value: c, label: nativeName(c), sub: langName(c, lang) })).sort((a, b) => (a.sub ?? "").localeCompare(b.sub ?? "")), [lang]);
  const curItems = useMemo(() => CURRENCIES.map((c) => ({ value: c, label: `${c} — ${currencyName(c, lang)}` })), [lang]);

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
        <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Link to="/auth" className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
                  {photo ? <img src={photo} referrerPolicy="no-referrer" alt="" className="size-full object-cover" /> : <UserIcon className="size-5 text-muted-foreground" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{profile?.display_name || t.profile}</span>
                  <span className="block truncate text-xs text-muted-foreground" dir="ltr">{user?.email}</span>
                </span>
              </Link>
              <Button size="icon" variant="soft" aria-label={t.signOut} onClick={() => { void signOut(); toast.success(t.done); }}><LogOut className="size-4" /></Button>
            </div>
        </section>
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold">{t.photoSetting}</h2>
          {hasGoogle && (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>{t.useGooglePhoto}</span>
              <Switch checked={profile?.use_google_avatar ?? true} onCheckedChange={(v) => void updateProfile({ use_google_avatar: v })} />
            </label>
          )}
          {!(hasGoogle && (profile?.use_google_avatar ?? true)) && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="soft" onClick={() => photoRef.current?.click()}><Upload className="size-4" /> {t.uploadPhoto}</Button>
              <Button variant="soft" className="text-destructive" disabled={!profile?.avatar_url} onClick={() => void updateProfile({ avatar_url: null })}>{t.removePhoto}</Button>
            </div>
          )}
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onPhoto(f); e.target.value = ""; }} />
        </section>
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <button onClick={() => setCurOpen(true)} className={`${inputCls} flex items-center justify-between`}>
            <span className="flex items-center gap-2"><Coins className="size-4 text-primary" /> {t.currency}</span>
            <span className="flex items-center gap-1 text-muted-foreground">{settings.currency} <ChevronLeft className="size-4 ltr:rotate-180" /></span>
          </button>
          <button onClick={() => setLangOpen(true)} className={`${inputCls} flex items-center justify-between`}>
            <span className="flex items-center gap-2"><Globe className="size-4 text-primary" /> {t.language}</span>
            <span className="flex items-center gap-1 text-muted-foreground">{nativeName(settings.lang)} <ChevronLeft className="size-4 ltr:rotate-180" /></span>
          </button>
          {settings.lang !== "ar" && settings.lang !== "en" && <p className="text-xs text-muted-foreground">{t.uiFallback}</p>}
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

      <Picker open={langOpen} onOpenChange={setLangOpen} title={t.language} items={langItems} value={settings.lang} onPick={(v) => setSettings({ lang: v })} />
      <Picker open={curOpen} onOpenChange={setCurOpen} title={t.currency} items={curItems} value={settings.currency} onPick={(v) => setSettings({ currency: v })} />
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
