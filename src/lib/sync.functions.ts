import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { snapshotSchema } from "./sync-schema";

export const readFinancialState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("financial_states").select("data, revision, updated_at").eq("user_id", context.userId).maybeSingle();
    if (error) throw new Error("Unable to read financial state");
    return data ? { snapshot: snapshotSchema.parse(data.data), revision: data.revision, updatedAt: data.updated_at } : null;
  });

export const writeFinancialState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ revision: z.number().int().nonnegative(), snapshot: snapshotSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: revision, error } = await context.supabase.rpc("save_financial_state", { expected_revision: data.revision, snapshot: data.snapshot });
    if (error) throw new Error("Unable to save financial state");
    return revision;
  });