import type { Metadata } from "next";
import { FutureRentPage } from "@/components/scenarios/FutureRentPage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata: Metadata = buildPageMetadata({
  title: "Kalkulačka budoucího příjmu z nájmu",
  description:
    "Modelově uznaný nájem a tok po nákladech a splátce. Podíl uznání je ilustrativní, ne metodika konkrétní banky.",
  path: scenarioRoutes.rentCalc,
});

export default function Page() {
  return <FutureRentPage mode="calculator" />;
}
