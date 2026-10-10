import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile { id: string; display_name: string | null; avatar_url: string | null }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User | null) => {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url").eq("id", u.id).maybeSingle();
    setProfile(data ?? { id: u.id, display_name: (u.user_metadata?.full_name as string) ?? null, avatar_url: null });
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
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

  const saveProfile = async (display_name: string, avatar_url: string | null) => {
    if (!user) return false;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name, avatar_url, updated_at: new Date().toISOString() });
    if (!error) setProfile({ id: user.id, display_name, avatar_url });
    return !error;
  };

  return { user, profile, loading, saveProfile, signOut: () => supabase.auth.signOut() };
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
