import type { Metadata } from "next";
import { FutureProjectionsView } from "@/components/sections/FutureProjectionsView";

export const metadata: Metadata = {
  title: "Potenciální vývoj | HypotékaJasně.cz",
  description:
    "20leté predikce realitních trhů s inflací a přepínatelnými investičními scénáři.",
};

export default function PotencialniVyvojPage() {
  return <FutureProjectionsView />;
}
