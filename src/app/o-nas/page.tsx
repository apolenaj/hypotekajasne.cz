import type { Metadata } from "next";
import { AboutUsView } from "@/components/sections/AboutUsView";
import { LeadGen } from "@/components/sections/LeadGen";

export const metadata: Metadata = {
  title: "O nás | HypotékaJasně.cz",
  description:
    "Poznejte tým HypotékaJasně.cz — zakladatele Josefa Apolenáře a experta na hypotéky Michala Heinzkeho.",
};

export default function ONasPage() {
  return (
    <>
      <AboutUsView />
      <LeadGen />
    </>
  );
}
