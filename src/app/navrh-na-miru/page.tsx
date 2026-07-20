import type { Metadata } from "next";
import { MortgageReadinessWizard } from "@/components/mortgage-readiness/MortgageReadinessWizard";

export const metadata: Metadata = {
  title: "Hypoteční připravenost | HypotékaJasně.cz",
  description:
    "Orientační skóre hypoteční připravenosti, personalizovaný action plan a bezpečný odkaz na nemovitosti v rozpočtu na Majetio.",
};

export default function NavrhNaMiruPage() {
  return <MortgageReadinessWizard />;
}
