import { ToolError, type ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "./supabase";
import { snapshotSchema } from "../sync-schema";
export async function readSnapshot(ctx: ToolContext) {
  const userId = ctx.getUserId();
  if (!ctx.isAuthenticated() || !userId) throw new ToolError("Sign in required.");
  const { data, error } = await supabaseForUser(ctx).from("financial_states").select("data, revision, updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw new ToolError("Unable to read your synced financial data.");
  if (!data) throw new ToolError("No synced data yet. Open Zad and finish synchronization first.");
  const parsed = snapshotSchema.safeParse(data.data);
  if (!parsed.success) throw new ToolError("Your synced data could not be read safely.");
  return { snapshot: parsed.data, revision: data.revision, updatedAt: data.updated_at };
}
