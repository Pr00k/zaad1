import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile { id: string; display_name: string | null; avatar_url: string | null; use_google_avatar: boolean }

function googlePhoto(u: User | null): string | null {
  const m = u?.user_metadata ?? {};
  return (m["avatar_url"] as string) || (m["picture"] as string) || null;
}

const GUEST_KEY = "zad-guest";
const readGuest = () => { try { return localStorage.getItem(GUEST_KEY) === "1"; } catch { return false; } };

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuestState] = useState(false);

  const setGuest = (v: boolean) => {
    try { if (v) localStorage.setItem(GUEST_KEY, "1"); else localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
    setGuestState(v);
  };

  const loadProfile = async (u: User | null) => {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url, use_google_avatar").eq("id", u.id).maybeSingle();
    const pending = localStorage.getItem("zad-pending-avatar");
    if (pending && data && !data.avatar_url) {
      localStorage.removeItem("zad-pending-avatar");
      await supabase.from("profiles").update({ avatar_url: pending, use_google_avatar: false }).eq("id", u.id);
      data.avatar_url = pending; data.use_google_avatar = false;
    }
    setProfile(data ?? { id: u.id, display_name: (u.user_metadata?.["full_name"] as string) ?? null, avatar_url: null, use_google_avatar: true });
  };

  useEffect(() => {
    setGuestState(readGuest());
    const { data: sub } = supabase.auth.onAuthStateChange((e, session) => {
      if (e === "TOKEN_REFRESHED") return;
      const u = session?.user ?? null;
      if (u) setGuest(false);
      setUser(u);
      setTimeout(() => void loadProfile(u), 0);
    });
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) setGuest(false);
      setUser(data.user);
      await loadProfile(data.user);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const updateProfile = async (patch: Partial<Omit<Profile, "id">>) => {
    if (!user) return false;
    const next = { ...(profile ?? { display_name: null, avatar_url: null, use_google_avatar: true }), ...patch, id: user.id };
    const { error } = await supabase.from("profiles").upsert({ ...next, updated_at: new Date().toISOString() });
    if (!error) setProfile(next as Profile);
    return !error;
  };

  const hasGoogle = !!googlePhoto(user);
  const photo = profile?.use_google_avatar && hasGoogle ? googlePhoto(user) : profile?.avatar_url ?? null;

  return { user, profile, loading, photo, hasGoogle, updateProfile, signOut: () => supabase.auth.signOut() };
}

type Ctx = ReturnType<typeof useAuthState>;
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const v = useAuthState();
  return <AuthCtx.Provider value={v}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

/** Resize an image file to a small square JPEG data URL (stored with the profile). */
export function fileToAvatar(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
