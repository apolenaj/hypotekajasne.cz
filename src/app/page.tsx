import { HomeCountryGrid } from "@/components/sections/HomeCountryGrid";
import { FindMyPathView } from "@/components/sections/FindMyPathView";
import { MajetioPromoSection } from "@/components/sections/MajetioPromoSection";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <HomeCountryGrid />
      <FindMyPathView />
      <MajetioPromoSection />
    </>
  );
}
