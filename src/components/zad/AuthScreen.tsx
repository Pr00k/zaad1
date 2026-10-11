import { useRef, useState } from "react";
import { Camera, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "./ui";
import { useT } from "@/lib/i18n";
import { useZad } from "@/lib/store";
import { fileToAvatar } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  name: z.string().trim().max(40),
});

export function AuthScreen() {
  const { t } = useT();
  const setSettings = useZad((s) => s.setSettings);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error(t.authError); setBusy(false); return; }
    if (r.redirected) return;
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse({ email, password, name });
    if (!p.success || (mode === "up" && !p.data.name)) { toast.error(t.authError); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email: p.data.email, password: p.data.password });
      setBusy(false);
      if (error) toast.error(t.authError);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: p.data.email, password: p.data.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: p.data.name } },
    });
    if (!error && avatar) {
      if (data.user && data.session) await supabase.from("profiles").upsert({ id: data.user.id, display_name: p.data.name, avatar_url: avatar, use_google_avatar: false });
      else localStorage.setItem("zad-pending-avatar", avatar);
    }
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSettings({ name: p.data.name });
    if (!data.session) { toast.success(t.checkEmail, { duration: 8000 }); setMode("in"); }
  };

  const onFile = async (f: File) => {
    if (!f.type.startsWith("image/") || f.size > 10 * 1024 * 1024) return;
    try { setAvatar(await fileToAvatar(f)); } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto mt-8 max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-gold">زاد</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mode === "in" ? t.welcome : t.createAccount}</p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-card p-5">
        {mode === "up" && (
          <>
            <div className="flex flex-col items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="relative grid size-20 place-items-center overflow-hidden rounded-full border-2 border-primary/50 bg-muted">
                {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : <UserIcon className="size-8 text-muted-foreground" />}
                <span className="absolute inset-x-0 bottom-0 grid place-items-center bg-background/70 py-0.5"><Camera className="size-3.5" /></span>
              </button>
              <span className="text-xs text-muted-foreground">{t.photoOptional}</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }} />
            </div>
            <Field label={t.yourName}>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required className={inputCls} />
            </Field>
          </>
        )}
        <Field label={t.email}>
          <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className={inputCls} autoComplete="email" />
        </Field>
        <Field label={t.password}>
          <input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={72} className={inputCls} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        </Field>
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>
          {mode === "in" ? t.signIn : t.createAccount}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{t.or}<span className="h-px flex-1 bg-border" /></div>

        <Button type="button" size="lg" variant="soft" className="w-full gap-3" onClick={google} disabled={busy}>
          <GoogleIcon /> {t.signInGoogle}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{mode === "in" ? t.noAccount : t.haveAccount} </span>
        <Button variant="link" className="px-1 text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? t.createAccount : t.signIn}
        </Button>
      </div>
    </div>
  );
}
