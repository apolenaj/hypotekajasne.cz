import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { rootMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = rootMetadata;

export default function Home() {
  return <HomeExperience />;
}
