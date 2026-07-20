import type { Metadata } from "next";
import { LegalView } from "@/components/sections/LegalView";

export const metadata: Metadata = {
  title: "Podmínky placené analýzy | HypotékaJasně.cz",
  description:
    "Cena, scope, delivery, reklamace a odstoupení u digitální Premium analýzy — draft k legal review.",
};

export default function PlacenaAnalyzaPage() {
  return <LegalView type="placena-analyza" />;
}
