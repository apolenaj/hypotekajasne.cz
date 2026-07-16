import type { Metadata } from "next";
import { FaqView } from "@/components/sections/FaqView";

export const metadata: Metadata = {
  title: "FAQ | HypotékaJasně.cz",
  description:
    "Nejčastější dotazy — nejsme banka ani poradci, kalkulace jsou orientační, platforma je pro klienty zdarma.",
};

export default function FaqPage() {
  return <FaqView />;
}
