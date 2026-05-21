"use client";

import { FormEvent, useState } from "react";
import { Copy, Gift, Info, Share2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Spinner } from "@/components/common/spinner";
import { StatCard, StatCardSkeleton } from "@/components/common/stat-card";
import { SyncBanner } from "@/components/common/sync-banner";
import { useToast } from "@/components/common/toast-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSmoothBusy } from "@/hooks/use-smooth-busy";
import { useReferralStats, useUseReferral } from "@/hooks/usePlatform";
import { getApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { redirect } from "next/navigation";

const defaultRules = {
  maxReferralsPerDay: 10,
  referralRewardLevel: 2,
  referralPointsReward: 200,
  referralXpReward: 100
};

export default function ReferralsPage() {
  redirect("/");
  return null;
}
