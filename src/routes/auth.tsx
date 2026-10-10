import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/zad/ui";
import { useT } from "@/lib/i18n";
import { useZad } from "@/lib/store";
import { useAuth, fileToAvatar } from "@/lib/auth";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "زاد — تسجيل الدخول" },
      { name: "description", content: "سجّل دخولك إلى زاد بحساب Google وأضف اسمك وصورتك." },
      { property: "og:title", content: "زاد — تسجيل الدخول" },
      { property: "og:description", content: "سجّل دخولك إلى زاد بحساب Google وأضف اسمك وصورتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

function AuthPage() {
  const { t } = useT();
  const nav = useNavigate();
  const setSettings = useZad((s) => s.setSettings);
  const { user, profile, loading, saveProfile } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) { setName(profile.display_name ?? ""); setAvatar(profile.avatar_url); }
  }, [profile]);

  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (r.error) { toast.error(String(r.error.message ?? r.error)); setBusy(false); return; }
    if (r.redirected) return;
    setBusy(false);
  };

  const onFile = async (f: File) => {
    if (!f.type.startsWith("image/") || f.size > 10 * 1024 * 1024) return toast.error(t.invalidAmount);
    try { setAvatar(await fileToAvatar(f)); } catch { toast.error(t.invalidAmount); }
  };

  const save = async () => {
    const n = name.trim().slice(0, 40);
    if (!n) return toast.error(t.yourName);
    setBusy(true);
    const ok = await saveProfile(n, avatar);
    setBusy(false);
    if (!ok) return toast.error("Error");
    setSettings({ name: n });
    toast.success(t.done);
    nav({ to: "/" });
  };

  if (loading) return <div className="grid h-[60dvh] place-items-center"><div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="mx-auto mt-6 max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-gold">{user ? t.profile : t.welcome}</h1>
        {!user && <p className="mt-2 text-sm text-muted-foreground">{t.signInHint}</p>}
      </div>

      {!user ? (
        <div className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <Button size="lg" variant="soft" className="w-full gap-3" onClick={google} disabled={busy}>
            <GoogleIcon /> {t.signInGoogle}
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => nav({ to: "/" })}>{t.skip}</Button>
        </div>
      ) : (
        <div className="space-y-5 rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => fileRef.current?.click()} className="relative size-24 overflow-hidden rounded-full border-2 border-primary/50 bg-muted">
              {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : <UserIcon className="m-auto size-10 text-muted-foreground" />}
              <span className="absolute inset-x-0 bottom-0 grid place-items-center bg-background/70 py-1"><Camera className="size-4" /></span>
            </button>
            <span className="text-xs text-muted-foreground">{t.photoOptional}</span>
            {avatar && <button className="text-xs text-destructive" onClick={() => setAvatar(null)}>✕</button>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }} />
          </div>
          <Field label={t.yourName}>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={inputCls} />
          </Field>
          <p className="text-center text-xs text-muted-foreground" dir="ltr">{user.email}</p>
          <Button variant="gold" size="lg" className="w-full" onClick={save} disabled={busy}>{t.save}</Button>
        </div>
      )}
    </div>
  );
}
