import { migrateFinancialState } from "./store";
import { snapshotSchema, type Snapshot } from "./sync-schema";

/** Read before applying Zustand state, which immediately persists its replacement. */
export function readPersistedSnapshot(storage: Pick<Storage, "getItem">, key: string): Snapshot | null {
  try {
    const raw = JSON.parse(storage.getItem(key) ?? "null");
    if (!raw?.state) return null;
    const version = Number.isInteger(raw.version) ? raw.version : 0;
    return snapshotSchema.parse(migrateFinancialState(raw.state, version));
  } catch { return null; }
}