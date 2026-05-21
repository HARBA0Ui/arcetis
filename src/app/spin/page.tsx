"use client";

import type { PrizeWheelRef } from "@mertercelik/react-prize-wheel";
import { useRef, useState } from "react";
import { Coins, Crown, Gem, Gift, Orbit, ShieldCheck, Sparkles, Star, Target, Zap } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { Spinner } from "@/components/common/spinner";
import { PrizeWheelDisplay } from "@/components/spin/prize-wheel-display";
import { SyncBanner } from "@/components/common/sync-banner";
import { useToast } from "@/components/common/toast-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountdown } from "@/hooks/use-countdown";
import { useSmoothBusy } from "@/hooks/use-smooth-busy";
import { usePlaySpin, useSpinStatus, useUserStats } from "@/hooks/usePlatform";
import { getApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { redirect } from "next/navigation";

const iconByName = {
  Sparkles,
  Coins,
  Star,
  Zap,
  Gem,
  Crown,
  Gift,
  ShieldCheck
} as const;

export default function SpinPage() {
  redirect("/");
  return null;
}
