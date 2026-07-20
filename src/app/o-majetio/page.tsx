import type { Metadata } from "next";
import { AboutMajetioView } from "@/components/sections/AboutMajetioView";

export const metadata: Metadata = {
  title: "Hypotéka Jasně & Majetio | Ekosystém",
  description:
    "Financial Passport, bezpečný handoff rozpočtu a role platforem: finance vs. property discovery. LIVE / BETA / COMING SOON.",
};

export default function OMajetioPage() {
  return <AboutMajetioView />;
}
