import type { Metadata } from "next";
import { InvestmentPassportView } from "@/components/sections/InvestmentPassportView";

export const metadata: Metadata = {
  title: "Mezinárodní investiční pas | HypotékaJasně.cz",
  description:
    "Zjistěte svůj investiční profil a top 3 země pro nemovitost – na míru kapitálu, cíli a riziku.",
};

export default function InvesticniPasPage() {
  return <InvestmentPassportView />;
}
