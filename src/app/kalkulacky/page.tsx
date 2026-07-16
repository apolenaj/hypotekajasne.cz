import type { Metadata } from "next";
import { KalkulackyView } from "@/components/pages/KalkulackyView";

export const metadata: Metadata = {
  title: "Kalkulačka hypotéky | HypotékaJasně.cz",
  description:
    "Personalizovaná hypoteční kalkulačka pro ČR i zahraniční investiční trhy.",
};

export default function KalkulackyPage() {
  return <KalkulackyView />;
}
