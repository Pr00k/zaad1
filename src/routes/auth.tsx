import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, PageTitle, inputCls } from "@/components/zad/ui";
import { useT } from "@/lib/i18n";
import { useZad } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "زاد — الملف الشخصي" },
      { name: "description", content: "عدّل اسمك في حساب زاد." },
      { property: "og:title", content: "زاد — الملف الشخصي" },
      { property: "og:description", content: "عدّل اسمك في حساب زاد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useT();
  const nav = useNavigate();
  const setSettings = useZad((s) => s.setSettings);
  const { user, profile, photo, updateProfile } = useAuth();
  const [name, setName] = useState("");
  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile]);

  const save = async () => {
    const n = name.trim().slice(0, 40);
    if (!n) { toast.error(t.yourName); return; }
    if (!(await updateProfile({ display_name: n }))) { toast.error(t.authError); return; }
    setSettings({ name: n });
    toast.success(t.done);
    nav({ to: "/settings" });
  };

  return (
    <>
      <PageTitle title={t.profile} />
      <div className="mt-4 space-y-4 rounded-3xl border border-border bg-card p-5">
        {photo && <img src={photo} alt="" className="mx-auto size-24 rounded-full object-cover" referrerPolicy="no-referrer" />}
        <Field label={t.yourName}>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={inputCls} />
        </Field>
        <p className="text-center text-xs text-muted-foreground" dir="ltr">{user?.email}</p>
        <Button variant="gold" size="lg" className="w-full" onClick={save}>{t.save}</Button>
      </div>
    </>
  );
}
