import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { readSnapshot } from "../read-snapshot";
export default defineTool({
  name: "list_transactions", title: "Recent transactions", description: "Read up to 100 of your latest cloud-synced transactions, optionally filtered by type.",
  inputSchema: { limit: z.number().int().min(1).max(100).default(20).describe("Maximum transactions (1–100)."), type: z.enum(["all", "income", "expense", "goal"]).default("all").describe("Transaction type to include.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, type }, ctx) => {
    const { snapshot: s, updatedAt } = await readSnapshot(ctx);
    const transactions = s.txs.filter(t => type === "all" || t.type === type).sort((a,b) => b.createdAt-a.createdAt).slice(0,limit).map(t => ({ id:t.id, type:t.type, amount:t.amount, note:t.note, date:t.date, vaultId:t.vaultId }));
    const result = { currency:s.settings.currency, updatedAt, transactions };
    return { content: [{ type:"text", text:JSON.stringify(result) }], structuredContent:result };
  },
});
