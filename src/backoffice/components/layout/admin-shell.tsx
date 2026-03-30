"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import { ClipboardList, LayoutDashboard, LogOut, Menu, PartyPopper, Package2, Settings2, Shield, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArcetisLogo } from "@/components/common/arcetis-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileNavSidebar } from "@/components/layout/mobile-nav-sidebar";
import { useNavigationProgress } from "@/components/navigation/navigation-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLogout, useMe } from "@/backoffice/hooks/useAuth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { startNavigation } = useNavigationProgress();
  const logout = useLogout();
  const { data: user } = useMe();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { href: "/backoffice/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/backoffice/dashboard/quests", label: "Quests", icon: Sparkles },
    { href: "/backoffice/dashboard/giveaways", label: "Giveaways", icon: PartyPopper },
    { href: "/backoffice/dashboard/sponsors", label: "Sponsors", icon: Shield },
    { href: "/backoffice/dashboard/products", label: "Products", icon: Package2 },
    { href: "/backoffice/dashboard/redemptions", label: "Redemptions", icon: ClipboardList },
    { href: "/backoffice/dashboard/users", label: "Users", icon: Users },
    { href: "/backoffice/dashboard/config", label: "Config", icon: Settings2 },
    { href: "/backoffice/dashboard/admins", label: "Admins", icon: Shield }
  ];
  const mobileNavItems = navItems.filter((item) => item.href !== "/backoffice/dashboard");

  function handleDashboardNavigation(event: MouseEvent<HTMLAnchorElement>) {
    setIsMobileNavOpen(false);

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (pathname === "/backoffice/dashboard") {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    startNavigation("/backoffice/dashboard");
    router.push("/backoffice/dashboard");
  }

  async function handleLogout() {
    startNavigation("/backoffice/login");
    await logout();
    router.replace("/backoffice/login");
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.12),transparent_33%),radial-gradient(circle_at_90%_8%,rgba(255,255,255,0.08),transparent_30%)]" />
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <Link href="/backoffice/dashboard" onClick={handleDashboardNavigation} className="shrink-0">
              <ArcetisLogo className="h-10" />
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle iconOnly className="h-10 w-10 border-border/80 bg-card text-foreground" />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open backoffice navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card text-foreground transition-colors hover:bg-muted/70"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/backoffice/dashboard" onClick={handleDashboardNavigation} className="shrink-0">
                <ArcetisLogo className="h-12 md:h-14" />
              </Link>

              <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 sm:flex">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-sm font-medium leading-4">{user?.username ?? "Admin"}</p>
                  <p className="text-xs text-muted-foreground">Arcetis Backoffice</p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle iconOnly className="h-9 w-9 border-border/80 bg-card text-foreground" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 w-9 border border-border/70 bg-card px-0"
                  aria-label="Disconnect"
                  title="Disconnect"
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const isHome = item.href === "/backoffice/dashboard" && pathname === item.href;
                const isSection = item.href !== "/backoffice/dashboard" && (pathname === item.href || pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-3 py-2 text-sm transition",
                      isHome || isSection
                        ? "border-border bg-card text-foreground shadow-sm"
                        : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <MobileNavSidebar
        open={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title="Backoffice"
        subtitle="Move between admin sections from one clean mobile sidebar instead of squeezing the whole dashboard nav into the header."
        links={mobileNavItems.map((item) => {
          const isHome = item.href === "/backoffice/dashboard" && pathname === item.href;
          const isSection =
            item.href !== "/backoffice/dashboard" && (pathname === item.href || pathname.startsWith(item.href));

          return {
            href: item.href,
            label: item.label,
            icon: item.icon,
            active: isHome || isSection,
            onNavigate: () => setIsMobileNavOpen(false)
          };
        })}
        footer={
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.username ?? "Admin"}</p>
                <p className="text-xs text-white/60">Arcetis Backoffice</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileNavOpen(false);
                void handleLogout();
              }}
              className="mt-4 flex w-full items-center gap-3 rounded-[1rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,122,24,0.12)] px-3.5 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(255,122,24,0.18)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        }
      />

      <main className="relative z-0 mx-auto max-w-7xl px-3 pt-6 sm:px-4 sm:pt-8">{children}</main>
    </div>
  );
}
