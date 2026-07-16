import type { Metadata } from "next";
import { MortgageAcademyView } from "@/components/sections/MortgageAcademyView";

export const metadata: Metadata = {
  title: "Hypoteční akademie | HypotékaJasně.cz",
  description:
    "LTV, RPSN, cash-flow a další pojmy vysvětlené lidsky — s příklady, pohledem banky a typickými chybami.",
};

export default function HypotecniAkademiePage() {
  return <MortgageAcademyView />;
}
