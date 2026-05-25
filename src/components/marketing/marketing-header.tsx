"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import { CircleDollarSign, ClipboardList, Home, LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArcetisLogo } from "@/components/common/arcetis-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { CurrencyToggle } from "@/components/common/currency-toggle";
import { GuestOrdersDrawer } from "@/components/orders/guest-orders-drawer";
import { NotificationCenter } from "@/components/common/notification-center";
import { UserMenu } from "@/components/common/user-menu";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useLogout, useMe } from "@/hooks/useAuth";

import { useLanguage } from "@/components/i18n/language-provider";
import { MobileNavSidebar } from "@/components/layout/mobile-nav-sidebar";
import { useNavigationProgress } from "@/components/navigation/navigation-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { language } = useLanguage();
  
  const sessionHint = useAuthToken();
  const { data: user } = useMe({ bootstrap: !sessionHint });
  const logout = useLogout();
  const hasVerifiedSession = !!sessionHint || !!user;

  const shopLabel = "Shop";
  const copy =
    language === "ar"
      ? {
          home: "الرئيسية",
          signIn: "تسجيل الدخول",
          createAccount: "إنشاء حساب"
        }
      : {
          home: "Home",
          signIn: "Sign in",
          createAccount: "Create account"
        };

  const links = [
    { href: "/", label: copy.home, icon: Home },
    { href: "/shop", label: shopLabel, icon: CircleDollarSign }
  ];
  const mobileLinks = links.filter((link) => link.href !== "/");

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

  async function handleLogout() {
    setIsMobileNavOpen(false);
    await logout();
  }

  return (
    <>
      <header className="rounded-[1.75rem] border border-border/70 bg-background/78 px-3 py-3 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.65)] backdrop-blur sm:rounded-[2rem] sm:px-4 sm:py-4 xl:px-6 sticky top-4 z-50">
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <Link href="/" onClick={handleHomeNavigation} className="shrink-0">
            <ArcetisLogo className="h-10" />
          </Link>

          <div className="flex items-center gap-2">
            <CurrencyToggle iconOnly className="h-10 w-10 rounded-2xl border-border/70 bg-background/70" />
            <ThemeToggle iconOnly className="h-10 w-10 rounded-2xl border-border/70 bg-background/70" />
            <GuestOrdersDrawer />
            {hasVerifiedSession ? <NotificationCenter /> : null}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-foreground transition-colors hover:bg-card/80"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="hidden sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link href="/" onClick={handleHomeNavigation} className="shrink-0">
            <ArcetisLogo className="h-12 md:h-16" />
          </Link>

          <nav className="-mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActiveRoute(pathname, link.href) ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  isActiveRoute(pathname, link.href)
                    ? "border-border/70 bg-card/85 text-foreground shadow-sm"
                    : "border-border/40 bg-background/60 text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            <CurrencyToggle iconOnly className="rounded-full border-border/70 bg-background/70 h-9 w-9" />
            <ThemeToggle iconOnly className="rounded-full border-border/70 bg-background/70" />
            <GuestOrdersDrawer />
            {hasVerifiedSession ? (
              <>
                <NotificationCenter />
                <UserMenu user={user ?? undefined} onLogout={() => void handleLogout()} />
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="min-w-[8.5rem] flex-1 rounded-full px-5 sm:min-w-0 sm:flex-none">
                  <Link href="/login">{copy.signIn}</Link>
                </Button>
                <Button asChild className="min-w-[8.5rem] flex-1 rounded-full px-5 sm:min-w-0 sm:flex-none">
                  <Link href="/register">{copy.createAccount}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileNavSidebar
        open={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title="Arcetis"
        subtitle={
          hasVerifiedSession
            ? "Open the pages you use most, then jump back into your account without fighting the mobile header."
            : "Browse the public pages, then jump into sign-in or account creation from one clean mobile menu."
        }
        links={mobileLinks.map((link) => ({
          ...link,
          active: isActiveRoute(pathname, link.href),
          onNavigate: () => setIsMobileNavOpen(false)
        }))}
        footer={
          hasVerifiedSession ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-white/48">Account</p>
              <div className="mt-3">
                <p className="text-sm font-semibold text-white">{user?.username ?? "Arcetis member"}</p>
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
                  href="/orders"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <ClipboardList className="h-4 w-4" />
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex items-center gap-3 rounded-[1rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,122,24,0.12)] px-3.5 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(255,122,24,0.18)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Button asChild variant="ghost" className="w-full justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-white hover:bg-white/[0.1] hover:text-white">
                <Link href="/login" onClick={() => setIsMobileNavOpen(false)}>
                  {copy.signIn}
                </Link>
              </Button>
              <Button asChild className="w-full justify-center rounded-full px-5">
                <Link href="/register" onClick={() => setIsMobileNavOpen(false)}>
                  {copy.createAccount}
                </Link>
              </Button>
            </div>
          )
        }
      />
    </>
  );
}

