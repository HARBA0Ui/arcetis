"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, Link2, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SectionHeader } from "@/backoffice/components/backoffice/section-header";
import { LoadingCard } from "@/backoffice/components/backoffice/loading-card";
import {
  useAdminQuestDetails,
  useAdminQuestSubmissions,
  useDeleteQuest,
  useReviewQuestSubmission,
  useUpdateQuest
} from "@/backoffice/hooks/useAdmin";
import { Spinner } from "@/components/common/spinner";
import { useToast } from "@/components/common/toast-center";
import { useNavigationProgress } from "@/components/navigation/navigation-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiError } from "@/lib/api";
import { normalizeAssetUrl } from "@/lib/assets";
import { formatDateTime } from "@/lib/format";
import type { QuestSubmissionStatus } from "@/lib/types";

const reviewStatusOptions: Array<{ value: "all" | QuestSubmissionStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All proofs" }
];

const submissionStatusTone: Record<QuestSubmissionStatus, string> = {
  pending: "border-[rgba(255,122,24,0.28)] bg-[rgba(255,122,24,0.08)] text-foreground",
  approved: "border-emerald-400/30 bg-emerald-400/12 text-emerald-100",
  rejected: "border-red-400/30 bg-red-400/12 text-red-100"
};

const imagePattern = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)(\?.*)?$/i;

function looksLikeImage(url?: string | null) {
  return !!url && imagePattern.test(url);
}

function ProofAttachmentCard({
  label,
  url
}: {
  label: string;
  url: string;
}) {
  const assetUrl = normalizeAssetUrl(url);
  const isImage = looksLikeImage(assetUrl);

  return (
    <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <a
          href={assetUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {isImage ? (
        <a href={assetUrl} target="_blank" rel="noreferrer" className="mt-4 block">
          <img
            src={assetUrl}
            alt={label}
            className="h-48 w-full rounded-xl border border-border/70 object-cover"
          />
        </a>
      ) : (
        <a
          href={assetUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border/80 px-4 text-center text-sm text-muted-foreground transition hover:bg-muted/30"
        >
          Open attachment
        </a>
      )}
    </div>
  );
}

export default function BackofficeQuestDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { startNavigation } = useNavigationProgress();
  const questId = params?.id;
  const requestedReviewId = searchParams.get("review");
  const quest = useAdminQuestDetails(questId);
  const reviewSubmission = useReviewQuestSubmission();
  const updateQuest = useUpdateQuest();
  const deleteQuest = useDeleteQuest();
  const [submissionStatus, setSubmissionStatus] = useState<"all" | QuestSubmissionStatus>("pending");
  const submissions = useAdminQuestSubmissions({
    questId,
    status: submissionStatus === "all" ? undefined : submissionStatus
  });

  const [form, setForm] = useState({
    pointsReward: "",
    xpReward: ""
  });
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(requestedReviewId);
  const [reviewNoteDrafts, setReviewNoteDrafts] = useState<Record<string, string>>({});

  const selectedSubmission = useMemo(
    () => {
      const availableSubmissions = submissions.data ?? [];

      if (availableSubmissions.length === 0) {
        return null;
      }

      if (selectedSubmissionId) {
        return availableSubmissions.find((submission) => submission.id === selectedSubmissionId) ?? availableSubmissions[0];
      }

      if (requestedReviewId) {
        return availableSubmissions.find((submission) => submission.id === requestedReviewId) ?? availableSubmissions[0];
      }

      return availableSubmissions[0];
    },
    [requestedReviewId, selectedSubmissionId, submissions.data]
  );
  const reviewNote = selectedSubmission
    ? reviewNoteDrafts[selectedSubmission.id] ?? selectedSubmission.reviewNote ?? ""
    : "";

  async function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!questId || !quest.data) {
      return;
    }

    const pointsReward = Number(form.pointsReward || quest.data.pointsReward);
    const xpReward = Number(form.xpReward || quest.data.xpReward);

    try {
      await updateQuest.mutateAsync({
        id: questId,
        pointsReward,
        xpReward
      });
      toast.success("Quest rewards updated", quest.data?.title ?? "Quest");
    } catch (error) {
      toast.error("Quest update failed", getApiError(error));
    }
  }

  async function handleDelete() {
    if (!quest.data || !questId || !window.confirm(`Delete ${quest.data.title}?`)) {
      return;
    }

    try {
      await deleteQuest.mutateAsync(questId);
      toast.success("Quest deleted", quest.data.title);
      startNavigation("/backoffice/dashboard/quests");
      router.replace("/backoffice/dashboard/quests");
    } catch (error) {
      toast.error("Delete failed", getApiError(error));
    }
  }

  async function handleSubmissionReview(nextStatus: "approved" | "rejected") {
    if (!questId || !selectedSubmission) {
      return;
    }

    try {
      await reviewSubmission.mutateAsync({
        id: selectedSubmission.id,
        questId,
        status: nextStatus,
        reviewNote: reviewNote.trim() || undefined
      });
      toast.success(
        nextStatus === "approved" ? "Quest proof approved" : "Quest proof rejected",
        selectedSubmission.user?.username ?? selectedSubmission.quest?.title ?? "Submission"
      );
      setReviewNoteDrafts((previous) => {
        const next = { ...previous };
        delete next[selectedSubmission.id];
        return next;
      });
    } catch (error) {
      toast.error("Quest review failed", getApiError(error));
    }
  }

  if (quest.isLoading && !quest.data) {
    return <LoadingCard label="Loading quest details..." />;
  }

  if (!quest.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">This quest could not be found.</CardContent>
      </Card>
    );
  }

  const isInstagramProofQuest =
    quest.data.category === "SOCIAL" && (quest.data.platform ?? "").toLowerCase().includes("instagram");

  return (
    <div className="space-y-6">
      <SectionHeader
        title={quest.data.title}
        subtitle="Review this task and adjust the live reward values for members."
        right={
          <Button asChild variant="outline">
            <Link href="/backoffice/dashboard/quests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to quests
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{quest.data.category}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {quest.data.completions} / {quest.data.maxCompletions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending proofs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{quest.data.stats.pendingSubmissions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved proofs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{quest.data.stats.approvedSubmissions}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quest summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quest.data.imageUrl ? (
              <img
                src={normalizeAssetUrl(quest.data.imageUrl)}
                alt={quest.data.title}
                className="h-48 w-48 rounded-xl border border-border object-cover"
              />
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{quest.data.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {quest.data.platform ? <Badge variant="outline">{quest.data.platform}</Badge> : null}
              {quest.data.link ? <Badge variant="outline">Has task link</Badge> : null}
              <Badge variant="outline">Level {quest.data.minLevel}+</Badge>
              <Badge variant="outline">{quest.data.requiresProof ? "Proof required" : "No proof required"}</Badge>
            </div>

            {quest.data.proofInstructions ? (
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-sm font-medium">Proof instructions</p>
                <p className="mt-2 text-sm text-muted-foreground">{quest.data.proofInstructions}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reward values</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quest-points">Points reward</Label>
                <Input
                  id="edit-quest-points"
                  type="number"
                  min={1}
                  value={form.pointsReward || String(quest.data.pointsReward)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, pointsReward: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quest-xp">XP reward</Label>
                <Input
                  id="edit-quest-xp"
                  type="number"
                  min={1}
                  value={form.xpReward || String(quest.data.xpReward)}
                  onChange={(event) => setForm((prev) => ({ ...prev, xpReward: event.target.value }))}
                />
              </div>

              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-sm font-medium">Current configuration</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <p>Minimum level: {quest.data.minLevel}</p>
                  <p>Completion limit: {quest.data.maxCompletions}</p>
                  <p>Rejected proofs: {quest.data.stats.rejectedSubmissions}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button disabled={updateQuest.isPending}>
                  {updateQuest.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </span>
                  ) : (
                    "Save rewards"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={deleteQuest.isPending}
                  onClick={() => void handleDelete()}
                >
                  {deleteQuest.isPending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                  Delete quest
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Proof reviews
              </CardTitle>

              <div className="flex flex-wrap gap-2">
                {reviewStatusOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={submissionStatus === option.value ? "default" : "outline"}
                    onClick={() => setSubmissionStatus(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissions.isLoading && !submissions.data ? (
              <p className="text-sm text-muted-foreground">Loading quest proofs...</p>
            ) : submissions.data?.length ? (
              submissions.data.map((submission) => (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => setSelectedSubmissionId(submission.id)}
                  className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                    selectedSubmission?.id === submission.id
                      ? "border-[hsl(var(--arcetis-ember))] bg-[rgba(255,122,24,0.08)]"
                      : "border-border/70 bg-background/60 hover:border-border hover:bg-background/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{submission.user?.username ?? "Member"}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {submission.user?.email ?? "Unknown email"}
                      </p>
                    </div>
                    <Badge className={submissionStatusTone[submission.status]} variant="outline">
                      {submission.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{formatDateTime(submission.createdAt)}</Badge>
                    {submission.proofUrl ? <Badge variant="outline">Primary proof</Badge> : null}
                    {submission.proofSecondaryUrl ? <Badge variant="outline">Secondary proof</Badge> : null}
                    {submission.proofText ? <Badge variant="outline">Note attached</Badge> : null}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                No quest submissions match this review view.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachment review</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedSubmission ? (
              <div className="rounded-xl border border-dashed border-border/80 p-5 text-sm text-muted-foreground">
                Select a quest submission to inspect the member&apos;s attachment and finish the review flow.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{selectedSubmission.user?.username ?? "Member submission"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedSubmission.user?.email ?? "Unknown email"} | submitted{" "}
                      {formatDateTime(selectedSubmission.createdAt)}
                    </p>
                  </div>
                  <Badge className={submissionStatusTone[selectedSubmission.status]} variant="outline">
                    {selectedSubmission.status}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Quest</p>
                    <p className="mt-3 font-semibold">{selectedSubmission.quest?.title ?? quest.data.title}</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Member level</p>
                    <p className="mt-3 font-semibold">Level {selectedSubmission.user?.level ?? "-"}</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reviewed</p>
                    <p className="mt-3 font-semibold">{formatDateTime(selectedSubmission.reviewedAt)}</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reviewer</p>
                    <p className="mt-3 font-semibold">{selectedSubmission.reviewedBy?.username ?? "-"}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {selectedSubmission.proofUrl ? (
                    <ProofAttachmentCard
                      label={isInstagramProofQuest ? "Profile screenshot" : "Primary proof"}
                      url={selectedSubmission.proofUrl}
                    />
                  ) : null}

                  {selectedSubmission.proofSecondaryUrl ? (
                    <ProofAttachmentCard
                      label={isInstagramProofQuest ? "Followed page screenshot" : "Secondary proof"}
                      url={selectedSubmission.proofSecondaryUrl}
                    />
                  ) : null}
                </div>

                {!selectedSubmission.proofUrl && !selectedSubmission.proofSecondaryUrl ? (
                  <div className="rounded-[1.15rem] border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                    No image attachment was included with this submission.
                  </div>
                ) : null}

                {selectedSubmission.proofText ? (
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Member note</p>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{selectedSubmission.proofText}</p>
                  </div>
                ) : null}

                {selectedSubmission.externalReference ? (
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">External reference</p>
                    </div>
                    <p className="mt-3 break-all text-sm text-muted-foreground">
                      {selectedSubmission.externalReference}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-[1.3rem] border border-border/70 bg-background/60 p-4">
                  <p className="text-sm font-medium">Review note</p>
                  <Textarea
                    className="mt-3 min-h-[140px]"
                    value={reviewNote}
                    onChange={(event) => {
                      if (!selectedSubmission) {
                        return;
                      }

                      setReviewNoteDrafts((previous) => ({
                        ...previous,
                        [selectedSubmission.id]: event.target.value
                      }));
                    }}
                    placeholder="Add an internal note before approving or rejecting this proof."
                    disabled={selectedSubmission.status !== "pending"}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={selectedSubmission.status !== "pending" || reviewSubmission.isPending}
                    onClick={() => void handleSubmissionReview("approved")}
                  >
                    {reviewSubmission.isPending ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Approve completion
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-red-500/35 bg-red-500/10 text-red-100 hover:bg-red-500/16"
                    disabled={selectedSubmission.status !== "pending" || reviewSubmission.isPending}
                    onClick={() => void handleSubmissionReview("rejected")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject proof
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
