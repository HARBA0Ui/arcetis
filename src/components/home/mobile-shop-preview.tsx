"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { RewardThumbnail } from "@/components/rewards/reward-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { getRewardStartingPointsCost } from "@/lib/reward-options";
import type { Reward } from "@/lib/types";

export function MobileShopPreview({
  id,
  eyebrow,
  title,
  description,
  rewards,
  headerHref,
  headerLabel,
  itemActionLabel,
  itemActionHref
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  rewards: Reward[];
  headerHref: string;
  headerLabel: string;
  itemActionLabel: string;
  itemActionHref: (reward: Reward) => string;
}) {
  const featuredRewards = useMemo(() => {
    const source = rewards.some((reward) => reward.stock > 0)
      ? rewards.filter((reward) => reward.stock > 0)
      : rewards;

    return [...source]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 3);
  }, [rewards]);

  return (
    <section id={id} className="space-y-4 sm:hidden">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full px-4">
          <Link href={headerHref}>
            {headerLabel}
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {featuredRewards.length ? (
        <div className="grid gap-3">
          {featuredRewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden rounded-[1.4rem] border-border/70 bg-card/92 shadow-sm">
              <CardContent className="flex gap-3 p-3">
                <div className="w-20 shrink-0">
                  <RewardThumbnail
                    title={reward.title}
                    imageUrl={reward.imageUrl}
                    className="aspect-square w-full rounded-[1rem] border-border/60 shadow-none"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="rounded-full bg-primary/12 px-2 py-1 text-[10px] text-foreground hover:bg-primary/12">
                      {formatNumber(getRewardStartingPointsCost(reward))} pts
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1 text-[10px]">
                      Lvl {reward.minLevel}
                    </Badge>
                    {reward.plans?.length ? (
                      <Badge variant="outline" className="px-2 py-1 text-[10px]">
                        {reward.plans.length} plan{reward.plans.length === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5">{reward.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{reward.description}</p>

                  <Button asChild size="sm" className="mt-3 h-9 rounded-full px-4">
                    <Link href={itemActionHref(reward)}>
                      {itemActionLabel}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[1.4rem] border-border/70 bg-card/92 shadow-sm">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Products will show up here as soon as the next batch is live.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
