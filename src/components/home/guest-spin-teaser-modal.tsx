"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useLanguage, type AppLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SpinItem } from "@/lib/types";

const GuestWheelPreview = dynamic(
  () => import("@/components/spin/prize-wheel-display").then((module) => module.PrizeWheelDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[14.75rem] w-full max-w-[14.75rem] items-center justify-center rounded-[1.4rem] border border-white/10 bg-black/18 text-sm text-white/60 sm:h-[19rem] sm:max-w-[19rem] sm:rounded-[2rem]">
        Loading wheel preview...
      </div>
    )
  }
);

const teaserItems: SpinItem[] = [
  { id: "guest-spin-1", label: "250 Points", points: 250, xp: 0, weight: 18, icon: "Coins" },
  { id: "guest-spin-2", label: "120 XP", points: 0, xp: 120, weight: 14, icon: "Zap" },
  { id: "guest-spin-3", label: "Bonus Reward", points: 160, xp: 45, weight: 10, icon: "Gift" },
  { id: "guest-spin-4", label: "Lucky Boost", points: 210, xp: 30, weight: 12, icon: "Sparkles" },
  { id: "guest-spin-5", label: "Starter Drop", points: 90, xp: 60, weight: 16, icon: "Star" },
  { id: "guest-spin-6", label: "Hot Streak", points: 180, xp: 80, weight: 11, icon: "Crown" }
];

function getModalCopy(language: AppLanguage) {
  if (language === "ar") {
    return {
      badge: "عجلة ترحيبية",
      title: "سجل الدخول أولًا لتفتح عجلة Arcetis الحقيقية.",
      description:
        "هذه مجرد معاينة لشكل العجلة داخل المنصة. لا يوجد دوران أو جائزة للحسابات غير المسجلة، لذلك سجّل الدخول أولًا ثم افتح العجلة من الداخل.",
      spinNow: "لف الآن",
      close: "إغلاق",
      createAccount: "إنشاء حساب",
      wheelLabel: "عرض مسبق للعجلة قبل تسجيل الدخول"
    };
  }

  return {
    badge: "Welcome spin",
    title: "Sign in first to unlock the real Arcetis wheel.",
    description:
      "This is only a visual preview of the wheel inside the platform. Guests cannot spin or earn rewards here, so sign in first and unlock the real spin from inside your account.",
    spinNow: "Spin now",
    close: "Close",
    createAccount: "Create account",
    wheelLabel: "Wheel preview before sign-in"
  };
}

export function GuestSpinTeaserModal() {
  const { language } = useLanguage();
  const copy = getModalCopy(language);
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/72 px-2 py-2 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />
      <div className="relative z-[1] max-h-[calc(100dvh-1rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(8,8,8,0.96),rgba(19,19,19,0.98)_52%,rgba(64,36,11,0.92))] text-white shadow-[0_40px_130px_-48px_rgba(0,0,0,0.95)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label={copy.close}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/80 transition-colors hover:bg-white/12 hover:text-white sm:right-4 sm:top-4 sm:h-10 sm:w-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-4 p-3.5 sm:gap-6 sm:p-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.78fr)] lg:items-center">
          <div>
            <Badge className="border-white/10 bg-white/12 text-white hover:bg-white/12">
              {copy.badge}
            </Badge>
            <h2 className="mt-3 max-w-[11ch] text-[2.05rem] font-semibold leading-[0.95] tracking-tight sm:mt-5 sm:max-w-[14ch] sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-3 max-w-xl text-[13px] leading-5 text-white/72 sm:mt-4 sm:text-base sm:leading-7">
              {copy.description}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button asChild size="lg" className="h-11 w-full rounded-full px-5 text-sm sm:h-12 sm:w-auto sm:px-7 sm:text-base">
                <Link href="/login?redirect=%2Fspin">
                  {copy.spinNow}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-full border-white/12 bg-white/6 px-5 text-sm text-white hover:bg-white/12 hover:text-white sm:h-12 sm:w-auto sm:px-7 sm:text-base"
              >
                <Link href="/register?redirect=%2Fspin">{copy.createAccount}</Link>
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-x-5 top-6 h-28 rounded-full bg-[radial-gradient(circle,rgba(255,146,64,0.3),rgba(255,146,64,0))] blur-3xl sm:inset-x-10 sm:top-8 sm:h-44" />
            <div className="w-full max-w-[17rem] rounded-[1.35rem] border border-white/10 bg-white/6 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:max-w-none sm:rounded-[2rem] sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-black/18 px-3 py-2.5 sm:mb-4 sm:rounded-[1.2rem] sm:px-4 sm:py-3">
                <div>
                  <p className="text-[13px] font-medium sm:text-sm">Arcetis</p>
                  <p className="text-xs text-white/58">{copy.wheelLabel}</p>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--arcetis-ember))] sm:h-4 sm:w-4" />
              </div>

              <GuestWheelPreview items={teaserItems} size="compact" className="max-w-[14.75rem] sm:max-w-[19rem]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
