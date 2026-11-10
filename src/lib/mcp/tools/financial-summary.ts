import { defineTool } from "@lovable.dev/mcp-js";
import { readSnapshot } from "../read-snapshot";
export default defineTool({
  name: "get_financial_summary", title: "Financial summary",
  description: "Read your cloud-synced balances, vault allocations and goal progress; excludes offline changes.", inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { snapshot: s, revision, updatedAt } = await readSnapshot(ctx);
    const summary = { currency: s.settings.currency, revision, updatedAt, balance: s.vaults.reduce((sum, v) => sum + v.balance, 0),
      vaults: s.vaults.map(v => ({ id: v.id, name: v.name || v.key || v.id, balance: v.balance, allocationPercent: v.pct })),
      goals: s.goals.map(g => ({ id: g.id, name: g.name, target: g.target, saved: g.saved, deadline: g.deadline })) };
    return { content: [{ type: "text", text: JSON.stringify(summary) }], structuredContent: summary };
  },
});
