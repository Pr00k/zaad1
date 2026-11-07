import { snapshotSchema, type Snapshot } from "./sync-schema";

export interface SyncCache { snapshot: Snapshot; revision: number | null; dirty: boolean }
export const cacheKey = (userId: string) => `zad-cloud-cache:${userId}`;
export function readCache(storage: Pick<Storage, "getItem">, userId: string): SyncCache | null {
  try {
    const raw = JSON.parse(storage.getItem(cacheKey(userId)) ?? "null");
    if (!raw || (raw.revision !== null && (!Number.isInteger(raw.revision) || raw.revision < 0)) || typeof raw.dirty !== "boolean") return null;
    return { snapshot: snapshotSchema.parse(raw.snapshot), revision: raw.revision, dirty: raw.dirty };
  } catch { return null; }
}
export function writeCache(storage: Pick<Storage, "setItem">, userId: string, cache: SyncCache) {
  storage.setItem(cacheKey(userId), JSON.stringify(cache));
}
export function hasConflict(cache: SyncCache, remoteRevision: number) {
  return cache.dirty && cache.revision !== remoteRevision;
}