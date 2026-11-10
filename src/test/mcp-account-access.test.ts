import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ToolContext } from "@lovable.dev/mcp-js";
const { factory, eq, row } = vi.hoisted(() => ({ factory: vi.fn(), eq: vi.fn(), row: vi.fn() }));
vi.mock("@/lib/mcp/supabase", () => ({ supabaseForUser: factory }));
import { readSnapshot } from "@/lib/mcp/read-snapshot";
import { initial } from "@/lib/store";
describe("MCP account reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eq.mockReturnValue({ maybeSingle: row });
    factory.mockReturnValue({ from: () => ({ select: () => ({ eq }) }) });
  });
  it("rejects an unauthenticated caller before data access", async () => {
    const ctx = { getUserId: () => null, isAuthenticated: () => false } as unknown as ToolContext;
    await expect(readSnapshot(ctx)).rejects.toThrow("Sign in required");
    expect(factory).not.toHaveBeenCalled();
  });
  it("reads only the verified caller's validated financial snapshot", async () => {
    const ctx = { getUserId: () => "caller-id", isAuthenticated: () => true } as unknown as ToolContext;
    row.mockResolvedValue({ data: { data: initial(), revision: 7, updated_at: "2026-11-10" }, error: null });
    const result = await readSnapshot(ctx);
    expect(eq).toHaveBeenCalledWith("user_id", "caller-id");
    expect(result.revision).toBe(7);
    expect(result.snapshot.vaults).toHaveLength(7);
  });
});