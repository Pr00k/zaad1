import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
function env(name: string) {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> }; Deno?: { env?: { get?: (n: string) => string | undefined } } };
  return runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
}
function configured(names: string[]) { return names.map(env).find(v => v?.trim())?.trim(); }
function url() { const v = configured(["SUPABASE_URL", "VITE_SUPABASE_URL"]); if (!v) throw new Error("Missing database configuration"); return v; }
function key() {
  const direct = configured(["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"]);
  if (direct) return direct;
  try {
    const parsed: unknown = JSON.parse(env("SUPABASE_PUBLISHABLE_KEYS") ?? "null");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const keys = parsed as Record<string, unknown>;
      const v = [keys['default'], ...Object.values(keys)].find((v): v is string => typeof v === "string" && v.trim().startsWith("sb_publishable_"));
      if (v) return v.trim();
    }
  } catch { /* Try legacy key. */ }
  const legacy = configured(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  throw new Error("Missing database configuration");
}
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token || !ctx.isAuthenticated()) throw new Error("Sign in required");
  return createClient(url(), key(), { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
}
