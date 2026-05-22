"use client";

import { useAuthToken } from "@/hooks/use-auth-token";
import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthToken();

  if (token) {
    return (
      <AppShell>
        {children}
      </AppShell>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="arcetis-landing-grid pointer-events-none absolute inset-0 -z-20" />
      <div className="arcetis-landing-orb absolute left-[-6rem] top-24 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,179,71,0.22),_rgba(255,179,71,0))] blur-3xl" />
      <div className="arcetis-landing-orb absolute right-[-4rem] top-10 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(98,190,255,0.16),_rgba(98,190,255,0))] blur-3xl" />

      <div className="mx-auto max-w-6xl">
        <MarketingHeader />
        <div className="mt-6">
          {children}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
