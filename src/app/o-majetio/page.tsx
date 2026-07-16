import type { Metadata } from "next";
import { AboutMajetioView } from "@/components/sections/AboutMajetioView";

export const metadata: Metadata = {
  title: "O Majetio.cz | HypotékaJasně.cz",
  description:
    "Jak spolu fungují Hypotéka Jasně a Majetio.cz — financování, edukace a katalog nemovitostí s investičním skóre.",
};

export default function OMajetioPage() {
  return <AboutMajetioView />;
}
