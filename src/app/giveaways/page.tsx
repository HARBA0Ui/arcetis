import type { Metadata } from "next";
import GiveawaysListContent from "./giveaways-list-content";

export const metadata: Metadata = {
  title: "Exclusive Giveaways & Free Product Drops - Arcetis",
  description: "Apply for active Arcetis giveaways. Earn free premium product redemptions, view entry rules, and track your application status in one place."
};

export default function GiveawaysPage() {
  return <GiveawaysListContent />;
}
