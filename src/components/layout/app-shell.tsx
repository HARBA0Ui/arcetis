"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  CircleDollarSign,
  ClipboardList,
  Gift,
  Home,
  LogOut,
  Menu,
  PartyPopper,
  Sparkles,
  UserRound,
  Users2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArcetisLogo } from "@/components/common/arcetis-logo";
import { NotificationCenter } from "@/components/common/notification-center";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileNavSidebar } from "@/components/layout/mobile-nav-sidebar";
import { UserMenu } from "@/components/common/user-menu";
import { ProtectedShellLoading } from "@/components/layout/protected-shell-loading";
import { SiteFooter } from "@/components/layout/site-footer";
import { useNavigationProgress } from "@/components/navigation/navigation-provider";
import { useAuthToken } from "@/hooks/use-auth-token";
import { isSessionError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLogout, useMe } from "@/hooks/useAuth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rewards", label: "Shop", icon: CircleDollarSign },
  { href: "/tasks", label: "Tasks", icon: Sparkles },
  { href: "/spin", label: "Spin", icon: Gift },
  { href: "/giveaways", label: "Giveaways", icon: PartyPopper },
  { href: "/referrals", label: "Referrals", icon: Users2 }
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const logout = useLogout();
  const sessionHint = useAuthToken();
  const { data: user, error, isError, isFetched } = useMe({ bootstrap: !sessionHint });
  const prefetchedRoutesRef = useRef(false);
  const logoutTarget = pathname === "/" ? "/" : "/login";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavItems = navItems.filter((item) => item.href !== "/");
  const hasVerifiedSession = !!sessionHint || !!user;

  function handleHomeNavigation(event: MouseEvent<HTMLAnchorElement>) {
    setIsMobileNavOpen(false);

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (pathname === "/") {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    startNavigation("/");
    router.push("/");
  }

  useEffect(() => {
    if (hasVerifiedSession || !isFetched) return;
    if (isError && !isSessionError(error, { includeNotFound: true })) return;

    void (async () => {
      startNavigation(logoutTarget);
      await logout();

      if (logoutTarget === pathname) {
        router.refresh();
        return;
      }

      router.replace(logoutTarget);
    })();
  }, [error, hasVerifiedSession, isError, isFetched, logout, logoutTarget, pathname, router, startNavigation]);

  useEffect(() => {
    if (!sessionHint) return;
    if (!isFetched || !isError || !isSessionError(error, { includeNotFound: true })) return;

    void (async () => {
      startNavigation(logoutTarget);
      await logout();
      router.replace(logoutTarget);
    })();
  }, [error, isError, isFetched, logout, logoutTarget, router, sessionHint, startNavigation]);

  async function handleLogout() {
    startNavigation(logoutTarget);
    await logout();
    if (logoutTarget === pathname) {
      router.refresh();
      return;
    }

    router.replace(logoutTarget);
  }

  useEffect(() => {
    if (!sessionHint) {
      return;
    }

    if (prefetchedRoutesRef.current) {
      return;
    }

    prefetchedRoutesRef.current = true;

    const timeoutId = window.setTimeout(() => {
      const warmRoutes = new Set([
        ...navItems.map((item) => item.href),
        "/profile",
        "/requests",
        "/giveaways/mine"
      ]);

      warmRoutes.forEach((href) => {
        void router.prefetch(href);
      });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router, sessionHint]);

  if (!hasVerifiedSession && !isFetched) {
    return <ProtectedShellLoading message="Refreshing your session..." />;
  }

  if (!hasVerifiedSession && isError && !isSessionError(error, { includeNotFound: true })) {
    return <ProtectedShellLoading message="We could not verify your session right now." />;
  }

  if (!hasVerifiedSession) {
    return <ProtectedShellLoading message="Refreshing your session..." />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden pb-12">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <Link href="/" onClick={handleHomeNavigation} className="shrink-0">
              <ArcetisLogo className="h-11" />
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle iconOnly className="h-10 w-10 rounded-2xl border-border/80 bg-card text-foreground" />
              <NotificationCenter />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card text-foreground transition-colors hover:bg-muted/70"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <Link href="/" onClick={handleHomeNavigation} className="mr-2 shrink-0">
              <ArcetisLogo className="h-14 md:h-20" />
            </Link>

            <nav className="-mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActiveRoute(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-sm transition-all",
                    isActiveRoute(pathname, item.href)
                      ? "border-border/70 bg-card/85 text-foreground shadow-sm"
                      : "text-muted-foreground hover:border-border/60 hover:bg-muted/55 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
              <ThemeToggle iconOnly className="h-12 w-12 rounded-2xl border-border/80 bg-card text-foreground" />
              <NotificationCenter />
              <UserMenu user={user ?? undefined} onLogout={() => void handleLogout()} />
            </div>
          </div>
        </div>
      </header>

      <MobileNavSidebar
        open={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title="Arcetis"
        subtitle="Open the pages you use most, then jump back into your account without fighting the mobile header."
        links={mobileNavItems.map((item) => ({
          ...item,
          active: isActiveRoute(pathname, item.href),
          onNavigate: () => setIsMobileNavOpen(false)
        }))}
        footer={
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
            <p className="text-[11px] uppercase tracking-[0.26em] text-white/48">Account</p>
            <div className="mt-3">
              <p className="text-sm font-semibold text-white">{user?.username ?? "Arcetis member"}</p>
              <p className="mt-1 text-xs text-white/60">
                Level {user?.level ?? 1} - {user?.points ?? 0} pts
              </p>
            </div>

            <div className="mt-4 grid gap-2">
              <Link
                href="/profile"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <UserRound className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/requests"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <ClipboardList className="h-4 w-4" />
                Requests
              </Link>
              <Link
                href="/giveaways/mine"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <PartyPopper className="h-4 w-4" />
                My giveaways
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  void handleLogout();
                }}
                className="flex items-center gap-3 rounded-[1rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,122,24,0.12)] px-3.5 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(255,122,24,0.18)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        }
      />

      <main className="relative mx-auto max-w-6xl min-w-0 overflow-x-clip px-3 pt-6 sm:px-4 sm:pt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
