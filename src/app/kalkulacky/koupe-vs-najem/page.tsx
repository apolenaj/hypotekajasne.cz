import type { Metadata } from "next";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";

export const metadata: Metadata = {
  title: "Koupě × Nájem | HypotékaJasně.cz",
  description:
    "Break-even analýza a graf porovnání koupě nemovitosti versus nájmu pro investiční rozhodnutí.",
};

export default function KoupeVsNajemPage() {
  return <BuyVsRentSection />;
}
