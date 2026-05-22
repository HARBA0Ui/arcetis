"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Coins, CreditCard, Search, ShieldCheck } from "lucide-react";
import { DeferredSection } from "@/components/common/deferred-section";
import { PageHeader } from "@/components/common/page-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { RedemptionConfirmModal } from "@/components/rewards/redemption-confirm-modal";
import { RewardThumbnail } from "@/components/rewards/reward-thumbnail";
import { Spinner } from "@/components/common/spinner";
import { SyncBanner } from "@/components/common/sync-banner";
import { useToast } from "@/components/common/toast-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationProgress } from "@/components/navigation/navigation-provider";
import { useSmoothBusy } from "@/hooks/use-smooth-busy";
import { useRedeemReward, useRewards, useRewardsCatalog, useUserStats } from "@/hooks/usePlatform";
import { getApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { getRewardDeliveryFields, getRewardStartingPointsCost, getRewardStartingTndPrice, getRewardStartingUsdPrice, rewardHasSelectablePlans } from "@/lib/reward-options";
import {
  canUserRedeemReward,
  getNextRewardTarget,
  getRewardTargetStatusLabel,
  getRewardTargetSummary
} from "@/lib/rewards";
import { cn } from "@/lib/utils";

const REWARDS_PAGE_SIZE = 9;

export default function RewardsPage() {
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const rewards = useRewards();
  const stats = useUserStats();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search.trim());
  const rewardsCatalog = useRewardsCatalog({
    q: deferredSearch || undefined,
    page,
    pageSize: REWARDS_PAGE_SIZE
  });
  const redeem = useRedeemReward();
  const toast = useToast();
  const { t } = useLanguage();
  const [confirmState, setConfirmState] = useState<{
    rewardId: string;
    rewardTitle: string;
    pointsCost: number;
    planLabel?: string | null;
  } | null>(null);
  const hasRewardData = !!rewards.data || !!stats.data;
  const showSyncBanner = useSmoothBusy(
    hasRewardData && (rewards.isFetching || stats.isFetching || rewardsCatalog.isFetching)
  );
  const activeRewardId = redeem.isPending ? redeem.variables?.rewardId : null;
  const isStatsBootstrapping = stats.isLoading && !stats.data;
  const isRewardsBootstrapping = rewardsCatalog.isLoading && !rewardsCatalog.data;
  const currentPage = rewardsCatalog.data?.page ?? page;
  const totalPages = rewardsCatalog.data?.totalPages ?? 1;
  const visiblePageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [currentPage, totalPages]);
  const rewardsGridFallback = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: REWARDS_PAGE_SIZE }).map((_, index) => (
        <Card key={index} className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border-border/70 bg-card/95">
          <Skeleton className="aspect-square w-full rounded-none" />
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title={t("rewardsTitle")}
        subtitle="Browse our catalog of products and get items securely."
      />



      {showSyncBanner ? <SyncBanner className="mb-4" message="Refreshing rewards..." /> : null}



      <Card className="mb-6 rounded-[1.8rem] border-border/70 bg-card/88 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-10"
              placeholder={t("searchProducts")}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {t("results", { count: rewardsCatalog.data?.total ?? 0 })}
            </Badge>
            <Badge variant="outline">
              {t("pageOf", { page: currentPage, total: totalPages })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <DeferredSection fallback={rewardsGridFallback}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewardsCatalog.data
            ? rewardsCatalog.data.items.map((reward) => {
              const canRedeem = canUserRedeemReward(reward, stats.data?.user);

              const startingCost = getRewardStartingPointsCost(reward);
              const startingTndPrice = getRewardStartingTndPrice(reward);
              const startingUsdPrice = getRewardStartingUsdPrice(reward);
              const needsDetails = rewardHasSelectablePlans(reward) || getRewardDeliveryFields(reward).length > 0;

              return (
                <Card key={reward.id} className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border-border/70 bg-card/95">
                  <div className="px-4 pt-4 sm:px-0 sm:pt-0">
                    <RewardThumbnail
                      title={reward.title}
                      imageUrl={reward.imageUrl}
                      className="mx-auto aspect-square w-full max-w-[9.5rem] rounded-[1rem] border-border/60 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.45)] sm:max-w-none sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b sm:shadow-none"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">

                      {reward.plans?.length ? <Badge variant="outline">{reward.plans.length} {t("plans").toLowerCase()}</Badge> : null}
                    </div>
                    <CardTitle className="text-base sm:text-lg">{reward.title}</CardTitle>
                    <CardDescription className="text-xs leading-5 sm:text-sm sm:leading-6">{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-3 text-sm">


                    {typeof startingTndPrice === "number" ? (
                      <p className="inline-flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-foreground">From {formatNumber(startingTndPrice, { maximumFractionDigits: 2 })} TND</span>
                      </p>
                    ) : null}
                    {typeof startingUsdPrice === "number" ? (
                      <p className="inline-flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4 text-[hsl(var(--arcetis-ember))]" />
                        <span className="text-foreground">From ${formatNumber(startingUsdPrice, { maximumFractionDigits: 2 })}</span>
                      </p>
                    ) : null}

                    <div className="mt-auto grid grid-cols-1 gap-2 pt-2">
                      <Button asChild>
                        <Link href={`/shop/${reward.id}`}>{needsDetails ? "Choose plan" : "Details"}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
            : isRewardsBootstrapping
              ? Array.from({ length: REWARDS_PAGE_SIZE }).map((_, index) => (
                  <Card key={index} className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border-border/70 bg-card/95">
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <CardHeader>
                      <Skeleton className="h-6 w-36" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : (
                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      Rewards are not available right now.
                    </CardContent>
                  </Card>
                )}
        </div>
      </DeferredSection>

      {rewardsCatalog.data && !rewardsCatalog.data.items.length ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {deferredSearch ? "No rewards match your search." : "No rewards available."}
        </p>
      ) : null}

      {rewardsCatalog.data && rewardsCatalog.data.totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {visiblePageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === currentPage ? "default" : "outline"}
              className="min-w-10"
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {confirmState ? (
        <RedemptionConfirmModal
          open={!!confirmState}
          rewardTitle={confirmState.rewardTitle}
          planLabel={confirmState.planLabel}
          pointsCost={confirmState.pointsCost}
          isPending={redeem.isPending}
          onClose={() => setConfirmState(null)}
          onConfirm={async () => {
            try {
              const created = await redeem.mutateAsync({ rewardId: confirmState.rewardId });
              setConfirmState(null);
              const nextPath = `/requests/${created.id}`;
              toast.success("Request created", "Your product request page is ready.");
              startNavigation(nextPath);
              router.push(nextPath);
            } catch (error) {
              toast.error("Redemption failed", getApiError(error));
            }
          }}
        />
      ) : null}
    </>
  );
}
