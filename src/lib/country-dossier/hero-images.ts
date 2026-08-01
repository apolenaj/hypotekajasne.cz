import type { CountryId } from "@/lib/calculators";

/**
 * Hero fotografie pro stránky Průvodce investora (Unsplash placeholdery).
 * Dubai: oficiálně požadovaný vizuál skyline.
 */
export const COUNTRY_HERO_IMAGES: Record<
  CountryId,
  { src: string; alt: string }
> = {
  dubai: {
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
    alt: "Panorama Dubaje — mrakodrapy a městská krajina",
  },
  cz: {
    src: "https://images.unsplash.com/photo-1541849541-841a7f6ef21e?auto=format&fit=crop&w=1920&q=80",
    alt: "Praha — historické centrum a Vltava",
  },
  spain: {
    src: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1920&q=80",
    alt: "Španělsko — pobřeží a architektura",
  },
  italy: {
    src: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1920&q=80",
    alt: "Itálie — benátské kanály",
  },
  croatia: {
    src: "https://images.unsplash.com/photo-1555990793-da111f7e6f4f?auto=format&fit=crop&w=1920&q=80",
    alt: "Chorvatsko — jaderské pobřeží",
  },
  bali: {
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920&q=80",
    alt: "Bali — tropická krajina",
  },
  saudi: {
    src: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1920&q=80",
    alt: "Saúdská Arábie — moderní skyline",
  },
  slovakia: {
    src: "https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=1920&q=80",
    alt: "Slovensko — Bratislava a Dunaj",
  },
};

export function getCountryHeroImage(countryId: CountryId) {
  return COUNTRY_HERO_IMAGES[countryId];
}
