import type { Metadata } from "next";
import { LegalView } from "@/components/sections/LegalView";

export const metadata: Metadata = {
  title: "Podmínky placené analýzy | HypotékaJasně.cz",
  description:
    "Stav placené analýzy nemovitosti, plánovaný rozsah a podmínky — služba se připravuje.",
};

export default function PlacenaAnalyzaPage() {
  return <LegalView type="placena-analyza" />;
}
