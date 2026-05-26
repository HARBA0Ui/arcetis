import type { Metadata } from "next";
import { prisma } from "@/server/utils/prisma";
import GiveawayDetailContent from "./giveaway-detail-content";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  try {
    const giveaway = await prisma.giveaway.findUnique({
      where: { id },
      select: { title: true, description: true }
    });

    if (giveaway) {
      return {
        title: `${giveaway.title} - Arcetis Giveaway`,
        description: giveaway.description || "Enter this Arcetis giveaway to secure rewards."
      };
    }
  } catch (error) {
    // Fallback to generic title on error
  }

  return {
    title: "Giveaway Details - Arcetis",
    description: "Enter this active Arcetis giveaway to secure premium rewards and check your submission rules."
  };
}

export default function GiveawayDetailPage() {
  return <GiveawayDetailContent />;
}
