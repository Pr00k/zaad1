import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile { id: string; display_name: string | null; avatar_url: string | null; use_google_avatar: boolean }

function googlePhoto(u: User | null): string | null {
  const m = u?.user_metadata ?? {};
  return (m["avatar_url"] as string) || (m["picture"] as string) || null;
}

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User | null) => {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url, use_google_avatar").eq("id", u.id).maybeSingle();
    setProfile(data ?? { id: u.id, display_name: (u.user_metadata?.["full_name"] as string) ?? null, avatar_url: null, use_google_avatar: true });
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((e, session) => {
      if (e === "TOKEN_REFRESHED") return;
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => void loadProfile(u), 0);
    });
    supabase.auth.getUser().then(async ({ data }) => {
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
