import type { Metadata } from "next";
import { AboutUsView } from "@/components/sections/AboutUsView";
import { LeadGen } from "@/components/sections/LeadGen";

export const metadata: Metadata = {
  title: "O nás | HypotékaJasně.cz",
  description:
    "Procesní dokonalost, data a technologie — kdo stojí za HypotékaJasně.cz a Majetio.cz.",
};

export default function ONasPage() {
  return (
    <>
      <AboutUsView />
      <LeadGen />
    </>
  );
}
