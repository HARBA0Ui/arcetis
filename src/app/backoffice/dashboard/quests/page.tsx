"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { SectionHeader } from "@/backoffice/components/backoffice/section-header";
import { LoadingCard } from "@/backoffice/components/backoffice/loading-card";
import { Spinner } from "@/components/common/spinner";
import { useToast } from "@/components/common/toast-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminQuestSubmissions, useCreateQuest, useQuests, useUploadQuestImage } from "@/backoffice/hooks/useAdmin";
import { getApiError } from "@/lib/api";
import { normalizeAssetUrl } from "@/lib/assets";
import { formatDateTime } from "@/lib/format";

export default function BackofficeQuestsPage() {
  const quests = useQuests();
  const pendingReviews = useAdminQuestSubmissions({ status: "pending" });
  const createQuest = useCreateQuest();
  const uploadQuestImage = useUploadQuestImage();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "DAILY" as "DAILY" | "SOCIAL" | "SPONSORED",
    platform: "",
    link: "",
    xpReward: 10,
    pointsReward: 20,
    minLevel: 1
  });
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState("");

  useEffect(() => {
    return () => {
      if (createPreview) {
        URL.revokeObjectURL(createPreview);
      }
    };
  }, [createPreview]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      let imageUrl = form.imageUrl.trim() || undefined;

      if (createImage) {
        imageUrl = await uploadQuestImage.mutateAsync(createImage);
      }

      await createQuest.mutateAsync({
        ...form,
        imageUrl,
        platform: form.platform || undefined,
        link: form.link || undefined
      });

      toast.success("Quest created", form.title);
      setForm({
        title: "",
        description: "",
        imageUrl: "",
        category: "DAILY",
        platform: "",
        link: "",
        xpReward: 10,
        pointsReward: 20,
        minLevel: 1
      });
      setCreateImage(null);
      if (createPreview) {
        URL.revokeObjectURL(createPreview);
      }
      setCreatePreview("");
    } catch (error) {
      toast.error("Quest create failed", getApiError(error));
    }
  };

  return (
    <div>
      <SectionHeader
        title="Quests"
        subtitle="Create tasks, watch the proof review queue, and open a detail page to inspect attachments or update rewards."
        right={<Badge variant="secondary">Pending proofs: {pendingReviews.data?.length ?? 0}</Badge>}
      />
      {quests.isLoading ? <LoadingCard label="Loading quests..." /> : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5" />
            Proof Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingReviews.isLoading && !pendingReviews.data ? (
            <p className="text-sm text-muted-foreground">Loading pending proof reviews...</p>
          ) : pendingReviews.data?.length ? (
            pendingReviews.data.slice(0, 6).map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{submission.quest?.title ?? "Quest proof"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {submission.user?.username ?? "Member"} | {submission.user?.email ?? "Unknown email"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{formatDateTime(submission.createdAt)}</Badge>
                    {submission.proofUrl ? <Badge variant="outline">Primary proof</Badge> : null}
                    {submission.proofSecondaryUrl ? <Badge variant="outline">Secondary proof</Badge> : null}
                    {submission.proofText ? <Badge variant="outline">Note attached</Badge> : null}
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link href={`/backoffice/dashboard/quests/${submission.questId}?review=${submission.id}`}>
                    Review proof
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 p-5 text-sm text-muted-foreground">
              No quest proofs are waiting for review right now.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Quest</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-quest-title">Task title</Label>
                <Input
                  id="create-quest-title"
                  placeholder="Follow Arcetis on Instagram, daily check-in..."
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-quest-description">Task description</Label>
                <Textarea
                  id="create-quest-description"
                  placeholder="Explain what the member should do and what counts as a completed task."
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-quest-category">Category</Label>
                  <Select
                    id="create-quest-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value as "DAILY" | "SOCIAL" | "SPONSORED"
                      }))
                    }
                  >
                    <option value="DAILY">DAILY</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="SPONSORED">SPONSORED</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-quest-platform">Platform</Label>
                  <Input
                    id="create-quest-platform"
                    placeholder="Instagram, website, Discord..."
                    value={form.platform}
                    onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-quest-link">Task link</Label>
                  <Input
                    id="create-quest-link"
                    placeholder="https://task-link.com"
                    value={form.link}
                    onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-quest-level">Minimum level</Label>
                  <Input
                    id="create-quest-level"
                    type="number"
                    min={1}
                    value={form.minLevel}
                    onChange={(event) => setForm((prev) => ({ ...prev, minLevel: Number(event.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-quest-xp">XP reward</Label>
                  <Input
                    id="create-quest-xp"
                    type="number"
                    min={1}
                    value={form.xpReward}
                    onChange={(event) => setForm((prev) => ({ ...prev, xpReward: Number(event.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-quest-points">Points reward</Label>
                  <Input
                    id="create-quest-points"
                    type="number"
                    min={1}
                    value={form.pointsReward}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, pointsReward: Number(event.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-quest-image-url">External image URL</Label>
                <Input
                  id="create-quest-image-url"
                  placeholder="https://image-link.com/task.png"
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-quest-image-file">Upload image</Label>
                <Input
                  id="create-quest-image-file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setCreateImage(file);
                    if (createPreview) {
                      URL.revokeObjectURL(createPreview);
                    }
                    setCreatePreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
                {createPreview ? (
                  <img
                    src={createPreview}
                    alt="Quest preview"
                    className="h-24 w-24 rounded-md border border-border object-cover"
                  />
                ) : null}
              </div>

              <Button className="w-full" disabled={createQuest.isPending || uploadQuestImage.isPending}>
                {createQuest.isPending || uploadQuestImage.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Creating...
                  </span>
                ) : (
                  "Create Quest"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quest Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quest</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(quests.data ?? []).map((quest) => (
                  <TableRow key={quest.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {quest.imageUrl ? (
                          <img
                            src={normalizeAssetUrl(quest.imageUrl)}
                            alt={quest.title}
                            className="h-8 w-8 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md border border-border bg-muted" />
                        )}
                        <span>{quest.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quest.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {quest.pointsReward} pts / {quest.xpReward} XP
                    </TableCell>
                    <TableCell>{quest.minLevel}+</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/backoffice/dashboard/quests/${quest.id}`}>
                          View details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
