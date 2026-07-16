import type { Metadata } from "next";
import { ContactView } from "@/components/sections/ContactView";

export const metadata: Metadata = {
  title: "Kontakt | HypotékaJasně.cz",
  description:
    "Kontaktujte HypotékaJasně.cz — info@hypotekajasne.cz, +420 727 814 810, Soukenická 6, Krnov.",
};

export default function KontaktPage() {
  return <ContactView />;
}
