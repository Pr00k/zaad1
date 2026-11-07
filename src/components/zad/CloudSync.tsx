import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Cloud, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initial, useZad } from "@/lib/store";
import { readFinancialState, writeFinancialState } from "@/lib/sync.functions";
import { cacheKey, hasConflict, readCache, writeCache, type SyncCache } from "@/lib/sync-cache";
import { selectSnapshot, type Snapshot } from "@/lib/sync-schema";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Modal } from "./ui";

type Status = "syncing" | "synced" | "offline" | "error" | "conflict";
const SyncContext = createContext<{ status: Status; retry: () => void; importGuest: () => void } | null>(null);
export const useCloudSync = () => useContext(SyncContext);

export function CloudSync({ children }: { children: ReactNode }) {
  const { user, guest, loading } = useAuth();
  const { t } = useT();
  const read = useServerFn(readFinancialState);
  const write = useServerFn(writeFinancialState);
  const identity = loading ? "loading" : user?.id ?? (guest ? "guest" : "signed-out");
  const [loadedIdentity, setLoadedIdentity] = useState("");
  const [status, setStatus] = useState<Status>("syncing");
  const [actions, setActions] = useState<{ retry: () => void; resolve: (cloud: boolean) => void; importGuest: () => void }>({ retry: () => {}, resolve: () => {}, importGuest: () => {} });

  useEffect(() => {
    if (identity === "loading") return;
    let alive = true;
    let applying = false;
    let busy = false;
    let conflict: Awaited<ReturnType<typeof read>> = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe = () => {};
    const userId = user?.id;
    const apply = (snapshot: Snapshot) => {
      applying = true;
      useZad.setState(snapshot);
      applying = false;
    };
    useZad.persist.setOptions({ name: userId ? `zad-account:${userId}` : "zad-v4" });
    if (!userId) {
      apply(initial());
      Promise.resolve(useZad.persist.rehydrate()).then(() => { if (alive) setLoadedIdentity(identity); });
      return () => { alive = false; };
    }
    let cache: SyncCache = readCache(localStorage, userId) ?? { snapshot: initial(), revision: null, dirty: false };
    apply(cache.snapshot);
    setLoadedIdentity(identity);
    const persist = () => writeCache(localStorage, userId, cache);
    const sync = async () => {
      if (!alive || busy || conflict) return;
      if (!navigator.onLine) { setStatus("offline"); return; }
      busy = true;
      setStatus("syncing");
      try {
        const remote = await read();
        if (!alive) return;
        if (remote && hasConflict(cache, remote.revision)) {
          conflict = remote;
          setStatus("conflict");
          return;
        }
        if (!cache.dirty && remote) {
          cache = { snapshot: remote.snapshot, revision: remote.revision, dirty: false };
          apply(remote.snapshot);
          persist();
        } else {
          if (!remote && cache.revision !== null && cache.revision > 0) throw new Error("Missing remote state");
          const snapshot = cache.snapshot;
          const revision = await write({ data: { revision: remote?.revision ?? 0, snapshot } });
          if (!alive) return;
          if (revision === -1) { timer = setTimeout(() => void sync(), 200); return; }
          cache = { snapshot: cache.snapshot, revision, dirty: cache.snapshot !== snapshot };
          persist();
        }
        setStatus(cache.dirty ? "syncing" : "synced");
        if (cache.dirty) timer = setTimeout(() => void sync(), 600);
      } catch {
        if (alive) setStatus(navigator.onLine ? "error" : "offline");
      } finally { busy = false; }
    };
    unsubscribe = useZad.subscribe((state) => {
      if (applying || !alive) return;
      cache = { ...cache, snapshot: selectSnapshot(state), dirty: true };
      persist();
      if (!conflict) setStatus(navigator.onLine ? "syncing" : "offline");
      clearTimeout(timer);
      timer = setTimeout(() => void sync(), 650);
    });
    setActions({
      retry: () => void sync(),
      resolve: (cloud) => {
        if (!conflict) return;
        // Keep the discarded version recoverable on this device.
        localStorage.setItem(`${cacheKey(userId)}:backup:${Date.now()}`, JSON.stringify(cloud ? cache.snapshot : conflict.snapshot));
        cache = { snapshot: cloud ? conflict.snapshot : cache.snapshot, revision: conflict.revision, dirty: !cloud };
        if (cloud) apply(cache.snapshot);
        conflict = null;
        persist();
        void sync();
      },
      importGuest: () => {
        try {
          const raw = JSON.parse(localStorage.getItem("zad-v4") ?? "null");
          if (!raw?.state || !useZad.getState().importData(JSON.stringify(raw.state))) return;
        } catch { /* keep existing account data */ }
      },
    });
    const onOnline = () => void sync();
    const onOffline = () => setStatus("offline");
    const onFocus = () => { if (document.visibilityState === "visible") void sync(); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onFocus);
    const interval = setInterval(() => void sync(), 15000);
    void sync();
    return () => {
      alive = false;
      unsubscribe();
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [identity]);

  if (loadedIdentity !== identity) return <div className="grid h-[60dvh] place-items-center"><RefreshCw className="size-8 animate-spin text-primary" /></div>;
  return <SyncContext.Provider value={user ? { status, retry: actions.retry, importGuest: actions.importGuest } : null}>
    {children}
    <Modal open={!!user && status === "conflict"} onOpenChange={() => {}} title={t.syncConflict}>
      <Cloud className="mb-3 size-7 text-primary" />
      <p className="text-sm leading-relaxed text-muted-foreground">{t.syncConflictHint}</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="gold" onClick={() => actions.resolve(true)}>{t.useCloudCopy}</Button>
        <Button variant="soft" onClick={() => actions.resolve(false)}>{t.keepDeviceCopy}</Button>
      </div>
    </Modal>
  </SyncContext.Provider>;
}