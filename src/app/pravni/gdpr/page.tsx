import type { Metadata } from "next";
import { LegalView } from "@/components/sections/LegalView";

export const metadata: Metadata = {
  title: "GDPR | HypotékaJasně.cz",
  description: "Ochrana osobních údajů a právní doložka platformy HypotékaJasně.cz.",
};

export default function GdprPage() {
  return <LegalView type="gdpr" />;
}
