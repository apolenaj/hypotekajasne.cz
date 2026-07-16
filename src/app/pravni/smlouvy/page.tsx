import type { Metadata } from "next";
import { LegalView } from "@/components/sections/LegalView";

export const metadata: Metadata = {
  title: "Smlouvy | HypotékaJasně.cz",
  description: "Smlouvy a podmínky užití webu HypotékaJasně.cz.",
};

export default function SmlouvyPage() {
  return <LegalView type="smlouvy" />;
}
