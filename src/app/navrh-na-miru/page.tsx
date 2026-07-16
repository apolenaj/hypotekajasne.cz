import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/sections/OnboardingWizard";

export const metadata: Metadata = {
  title: "Návrh na míru | HypotékaJasně.cz",
  description:
    "Sestavte si investiční profil a získejte přesný matematický model financování nemovitosti v ČR i zahraničí.",
};

export default function NavrhNaMiruPage() {
  return <OnboardingWizard />;
}
