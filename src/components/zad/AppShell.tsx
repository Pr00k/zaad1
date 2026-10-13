import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Wallet, Receipt, Target, Bell, Settings } from "lucide-react";
import { useZad } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ReminderEngine } from "./ReminderEngine";
import { AuthScreen } from "./AuthScreen";
import { AuthProvider, useAuth } from "@/lib/auth";

const NAV = [
  { to: "/", icon: Home, k: "home" },
  { to: "/vaults", icon: Wallet, k: "vaults" },
  { to: "/expenses", icon: Receipt, k: "activity" },
  { to: "/goals", icon: Target, k: "goals" },
  { to: "/reminders", icon: Bell, k: "reminders" },
  { to: "/settings", icon: Settings, k: "settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return <AuthProvider><Shell>{children}</Shell></AuthProvider>;
}

function Shell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.resolve(useZad.persist.rehydrate()).then(() => setReady(true));
  }, []);
  const { t, lang, dir } = useT();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 mx-auto max-w-md overflow-hidden">
        <div className="animate-orb absolute -top-24 -end-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="animate-orb absolute bottom-24 -start-20 size-64 rounded-full bg-chart-2/15 blur-3xl [animation-delay:-5s]" />
      </div>
      <main className="relative z-10 flex-1 px-4 pb-28 pt-[max(env(safe-area-inset-top),1rem)]">
        {ready && !loading ? (user ? children : <AuthScreen />) : <div className="grid h-[60dvh] place-items-center"><div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
      </main>
      {user && <nav className="glass fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        <ul className="grid grid-cols-6">
          {NAV.map(({ to, icon: Icon, k }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={to}>
                <Link to={to} className={cn("flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                  <span className={cn("grid size-8 place-items-center rounded-xl transition", active && "bg-accent shadow-glow")}><Icon className="size-[18px]" /></span>
                  <span className="truncate">{t[k]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>}
      {ready && user && <ReminderEngine />}
    </div>
  );
}
