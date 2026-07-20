import type { Metadata } from "next";
import { AboutMajetioView } from "@/components/sections/AboutMajetioView";

export const metadata: Metadata = {
  title: "Hypotéka Jasně a Majetio | Finance a nemovitosti",
  description:
    "Hypotéka Jasně: finance a rozhodování. Majetio: vyhledání, analýza a koupě nemovitosti. Finanční pas jako most — bez falešných počtů nabídek.",
};

export default function OMajetioPage() {
  return <AboutMajetioView />;
}
