"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BackofficeError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10">
      <Card className="w-full rounded-[2rem] border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--arcetis-ember))]/25 bg-[rgba(255,122,24,0.08)]">
            <AlertTriangle className="h-6 w-6 text-[hsl(var(--arcetis-ember))]" />
          </div>
          <div className="space-y-2">
            <CardTitle>Backoffice page hiccup</CardTitle>
            <p className="text-sm text-muted-foreground">
              The last action may already have worked. Try reopening this section or jump back to the dashboard instead
              of reloading the whole browser page.
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => reset()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry this page
          </Button>
          <Button asChild variant="outline">
            <Link href="/backoffice/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
