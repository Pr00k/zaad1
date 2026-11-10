import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { AuthScreen } from "@/components/zad/AuthScreen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "" }),
  head: () => ({ meta: [
    { title: "زاد — موافقة اتصال المساعد" },
    { name: "description", content: "راجع طلب اتصال المساعد بحساب زاد ووافق عليه أو ارفضه." },
    { property: "og:title", content: "زاد — موافقة اتصال المساعد" },
    { property: "og:description", content: "راجع صلاحيات اتصال المساعد بحساب زاد." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Consent,
  errorComponent: ConsentError,
});
function ConsentError() { const { t } = useT(); return <p role="alert" className="mt-8 text-destructive">{t.connectionError}</p>; }
type Details = { client?: { name?: string }; redirect_uri?: string; scope?: string; scopes?: string[]; redirect_url?: string; redirect_to?: string };
type Result = { data: Details | null; error: { message: string } | null };
// The beta SDK namespace may not yet be included in the installed declaration.
const oauth = (supabase.auth as unknown as { oauth: {
  getAuthorizationDetails: (id: string) => Promise<Result>;
  approveAuthorization: (id: string) => Promise<Result>;
  denyAuthorization: (id: string) => Promise<Result>;
} }).oauth;

function Consent() {
  const { authorization_id } = Route.useSearch();
  const { user, loading } = useAuth();
  const { t } = useT();
  const [details, setDetails] = useState<Details | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user || !authorization_id) return;
    let active = true;
    setDetails(null); setFailed(false);
    void oauth.getAuthorizationDetails(authorization_id).then(({ data, error }) => {
      if (!active) return;
      if (error || !data) { setFailed(true); return; }
      const target = data.redirect_url ?? data.redirect_to;
      if (target && !data.client) { window.location.assign(target); return; }
      setDetails(data);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [user?.id, authorization_id]);
  async function decide(approve: boolean) {
    if (busy || !details || !authorization_id) return;
    setBusy(true); setFailed(false);
    try {
      const { data, error } = await (approve ? oauth.approveAuthorization(authorization_id) : oauth.denyAuthorization(authorization_id));
      const target = data?.redirect_url ?? data?.redirect_to;
      if (error || !target) throw new Error("Authorization failed");
      window.location.assign(target);
    } catch { setFailed(true); setBusy(false); }
  }
  if (!authorization_id) return <ConsentError />;
  if (loading) return <p className="mt-8">{t.connectionLoading}</p>;
  if (!user) return <AuthScreen next={`/.lovable/oauth/consent?authorization_id=${encodeURIComponent(authorization_id)}`} />;
  const scopes = details?.scopes ?? details?.scope?.split(" ").filter(Boolean) ?? [];
  return <section className="mt-8 space-y-5">
    <h1 className="font-display text-2xl font-semibold">{t.connectAccount}</h1>
    <p className="text-lg font-semibold">{details?.client?.name}</p>
    <p dir="ltr" className="break-all text-sm text-muted-foreground">{user.email}</p>
    {details?.redirect_uri && <p dir="ltr" className="break-all text-sm text-muted-foreground">{details.redirect_uri}</p>}
    {!details && !failed && <p>{t.connectionLoading}</p>}
    {failed && <p role="alert" className="text-destructive">{t.connectionError}</p>}
    {details && <>
      <p className="text-sm leading-relaxed">{t.connectionAccess}</p>
      <ul className="space-y-2 text-sm">{scopes.map(scope => <li key={scope}>{scope === "email" ? t.shareEmail : scope === "openid" || scope === "profile" ? t.shareProfile : `${t.additionalPermission}: ${scope}`}</li>)}</ul>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.connectionBoundary}</p>
      <div className="flex flex-col gap-3">
        <Button variant="gold" disabled={busy} onClick={() => void decide(true)}>{t.approveConnection}</Button>
        <Button variant="soft" disabled={busy} onClick={() => void decide(false)}>{t.denyConnection}</Button>
      </div>
    </>}
  </section>;
}