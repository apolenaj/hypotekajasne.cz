import type { Metadata } from "next";
import { LegalView } from "@/components/sections/LegalView";

export const metadata: Metadata = {
  title: "Cookie policy | HypotékaJasně.cz",
  description:
    "Cookies: nezbytné vždy; analytika a marketing pouze se souhlasem — sjednoceno s GDPR.",
};

export default function CookiesPage() {
  return <LegalView type="cookies" />;
}
