import type { Metadata } from "next";
import { LegalView } from "@/components/sections/LegalView";

export const metadata: Metadata = {
  title: "Zásady | HypotékaJasně.cz",
  description: "Zásady používání platformy HypotékaJasně.cz.",
};

export default function ZasadyPage() {
  return <LegalView type="zasady" />;
}
