"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Copy, ExternalLink, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { RewardThumbnail } from "@/components/rewards/reward-thumbnail";
import { SyncBanner } from "@/components/common/sync-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmoothBusy } from "@/hooks/use-smooth-busy";
import { useRedemptionById, useRedemptionsByCode } from "@/hooks/usePlatform";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getDisplayRequestCode } from "@/lib/request-code";

import { useAuthToken } from "@/hooks/use-auth-token";
import { LogIn } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/arcetis_shop/";

const statusLabel = {
  pending: "Waiting for delivery",
  approved: "Delivered",
  rejected: "Rejected + refunded",
  expired: "Expired + refunded"
} as const;

const statusTone = {
  pending: "border-[rgba(255,122,24,0.28)] bg-[rgba(255,122,24,0.08)] text-foreground",
  approved: "border-emerald-400/30 bg-emerald-400/12 text-emerald-100",
  rejected: "border-red-400/30 bg-red-400/12 text-red-100",
  expired: "border-slate-400/30 bg-slate-400/12 text-slate-100"
} as const;

function formatDate(value?: string | null) {
  return formatDateTime(value);
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const requestId = params?.id ?? "";
  const byCode = searchParams?.get("byCode") === "true";
  
  const idQuery = useRedemptionById(byCode ? "" : requestId);
  const codeQuery = useRedemptionsByCode(byCode ? requestId : "");
  
  const query = byCode ? codeQuery : idQuery;
  const requests = byCode ? codeQuery.data : (idQuery.data ? [idQuery.data] : undefined);
  const request = requests?.[0]; // Primary request for status/info
  
  const { t } = useLanguage();
  const showSyncBanner = useSmoothBusy(!!request && query.isFetching);
  const [copied, setCopied] = useState(false);
  const displayCode = getDisplayRequestCode(request?.requestCode, request?.id);
  const token = useAuthToken();

  const requestedInfoEntries = Object.entries(request?.requestedInfo ?? {});

  return (
    <>
      {!token && request && (
        <div className="mb-6 rounded-lg border border-primary/50 bg-primary/10 p-4 flex gap-4">
          <LogIn className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <h5 className="text-primary font-semibold tracking-tight">Save this order permanently</h5>
            <div className="text-muted-foreground mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
              <span>You're currently viewing a guest order. Log in to automatically sync it to your account so you don't lose access.</span>
              <Button asChild size="sm" variant="default" className="shrink-0">
                <Link href="/login">Log In / Register</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title={request?.reward?.title ?? t("requestDetailsFallback")}
        subtitle={t("requestDetailsSubtitle")}
        right={
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">{t("backToRequests")}</Link>
          </Button>
        }
      />

      {showSyncBanner ? <SyncBanner message="Refreshing request..." /> : null}

      {request ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(21rem,0.75fr)]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card/95">
              <CardContent className="p-5 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <div className="w-full max-w-[220px] shrink-0">
                    <RewardThumbnail
                      title={request.reward?.title ?? "Reward"}
                      imageUrl={request.reward?.imageUrl}
                      className="aspect-square w-full rounded-[1.35rem] border-border/60 shadow-[0_24px_54px_-36px_rgba(0,0,0,0.72)]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-3xl font-semibold tracking-tight">{request.reward?.title ?? t("requestDetailsFallback")}</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                          {request.reward?.description}
                        </p>
                      </div>
                      <Badge className={statusTone[request.status]} variant="outline">
                        {request.status === "pending"
                          ? t("waitingForDelivery")
                          : request.status === "approved"
                            ? t("delivered")
                            : request.status === "rejected"
                              ? t("rejectedRefunded")
                              : t("expiredRefunded")}
                      </Badge>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {request.planLabel ? <Badge variant="outline">{request.planLabel}</Badge> : null}
                      <Badge variant="outline">{t("created")} {formatDate(request.createdAt)}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {requests && requests.length > 1 && (
              <Card className="rounded-[2rem] border-border/70 bg-card/95 overflow-hidden">
                <CardHeader>
                  <CardTitle>Other Items in this Order</CardTitle>
                </CardHeader>
                <CardContent className="p-0 border-t border-border/50 divide-y divide-border/50">
                  {requests.slice(1).map(req => (
                    <div key={req.id} className="flex gap-4 p-4">
                      {req.reward?.imageUrl ? (
                        <img 
                          src={req.reward.imageUrl} 
                          alt={req.reward.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted/50" />
                      )}
                      <div>
                        <h4 className="font-medium">{req.reward?.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{req.planLabel || "Standard"}</Badge>
                          <Badge className={statusTone[req.status]} variant="outline">{req.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="rounded-[2rem] border-border/70 bg-card/95">
              <CardHeader>
                <CardTitle>{t("whatToDo")}</CardTitle>
                <CardDescription>{t("followSteps")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-[1.3rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-medium">{t("stepCopyCode")}</p>
                  <p className="mt-1 text-muted-foreground">{t("stepCopyCodeHint")}</p>
                </div>
                <div className="rounded-[1.3rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-medium">{t("stepSendCode")}</p>
                  <p className="mt-1 text-muted-foreground">{t("stepSendCodeHint")}</p>
                </div>
                <div className="rounded-[1.3rem] border border-[rgba(255,122,24,0.25)] bg-[rgba(255,122,24,0.08)] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--arcetis-ember))]" />
                    <p className="leading-6 text-foreground">
                      {t("warningKeepCodeSafe")}
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-medium">{t("stepWait")}</p>
                  <p className="mt-1 text-muted-foreground">{t("stepWaitHint")}</p>
                </div>
              </CardContent>
            </Card>

            {requestedInfoEntries.length ? (
              <Card className="rounded-[2rem] border-border/70 bg-card/95">
                <CardHeader>
                  <CardTitle>{t("submittedInfo")}</CardTitle>
                  <CardDescription>{t("submittedInfoHint")}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {requestedInfoEntries.map(([key, value]) => (
                    <div key={key} className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{key}</p>
                      <p className="mt-2 text-sm break-all">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="rounded-[2rem] border-border/70 bg-card/95">
              <CardHeader className="items-center text-center">
                <CardTitle>{t("yourCode")}</CardTitle>
                <CardDescription>{t("yourCodeHint")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5 text-center">
                  <p className="font-mono text-3xl font-semibold tracking-[0.16em]">{displayCode}</p>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(displayCode);
                    setCopied(true);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? t("copied") : t("copyCode")}
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                    {t("openInstagram")}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4 text-sm text-muted-foreground">
                  <p>{t("status")}: <span className="font-medium text-foreground">{request.status === "pending"
                    ? t("waitingForDelivery")
                    : request.status === "approved"
                      ? t("delivered")
                      : request.status === "rejected"
                        ? t("rejectedRefunded")
                        : t("expiredRefunded")}</span></p>
                  <p className="mt-2">{t("created")}: {formatDate(request.createdAt)}</p>
                  {request.processedAt ? <p className="mt-2">{t("processed")}: {formatDate(request.processedAt)}</p> : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : query.isLoading ? (
        <Card className="max-w-3xl">
          <CardHeader>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-40 w-full rounded-[1.4rem]" />
            <Skeleton className="h-24 w-full rounded-[1.4rem]" />
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardContent className="p-6 text-sm text-muted-foreground">
            {t("requestNotFound")}
          </CardContent>
        </Card>
      )}
    </>
  );
}
