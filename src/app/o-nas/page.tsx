import type { Metadata } from "next";
import { AboutUsView } from "@/components/sections/AboutUsView";
import { LeadGen } from "@/components/sections/LeadGen";

export const metadata: Metadata = {
  title: "O nás | HypotékaJasně.cz",
  description:
    "Tým HypotékaJasně.cz: role, vzdělání, odpovědnost za obsah. Trust Center — kdo co dělá a jak vyděláváme.",
};

export default function ONasPage() {
  return (
    <>
      <AboutUsView />
      <LeadGen />
    </>
  );
}
