import type { Metadata } from "next";
import { ArticlesView } from "@/components/sections/ArticlesView";

export const metadata: Metadata = {
  title: "Investiční magazín | HypotékaJasně.cz",
  description:
    "Hloubkové články o hypotékách, zahraničních trzích a investičních strategiích.",
};

export default function ClankyPage() {
  return <ArticlesView />;
}
