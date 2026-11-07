import { describe, expect, it } from "vitest";
import { initial } from "@/lib/store";
import { cacheKey, hasConflict, readCache, writeCache } from "@/lib/sync-cache";
import { snapshotSchema } from "@/lib/sync-schema";

describe("Cloud sync protection", () => {
  it("keeps each account and guest data isolated", () => {
    localStorage.clear();
    localStorage.setItem("zad-v4", "guest-data");
    writeCache(localStorage, "account-a", { snapshot: { ...initial(), txs: [], settings: { name: "A", currency: "IQD", lang: "ar" } }, revision: 3, dirty: true });
    expect(readCache(localStorage, "account-b")).toBeNull();
    expect(readCache(localStorage, "account-a")?.snapshot.settings.name).toBe("A");
    expect(localStorage.getItem("zad-v4")).toBe("guest-data");
    expect(cacheKey("account-a")).not.toBe(cacheKey("account-b"));
  });
  it("preserves unsent changes across reloads and detects competing revisions", () => {
    const cache = { snapshot: initial(), revision: 4, dirty: true };
    writeCache(localStorage, "offline-account", cache);
    const restored = readCache(localStorage, "offline-account");
    expect(restored).toEqual(cache);
    expect(hasConflict(cache, 5)).toBe(true);
    expect(hasConflict(cache, 4)).toBe(false);
    expect(hasConflict({ ...cache, dirty: false }, 5)).toBe(false);
  });
  it("rejects malformed financial snapshots", () => {
    expect(snapshotSchema.safeParse({ ...initial(), vaults: [{ id: "bad", balance: "100" }] }).success).toBe(false);
  });
});