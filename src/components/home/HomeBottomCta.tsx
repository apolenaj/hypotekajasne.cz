import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

export function HomeBottomCta() {
  return (
    <section aria-labelledby="home-final-cta-heading" id="poptavka" className="relative isolate overflow-hidden text-white">
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=70"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f2f28] via-[#143d32]/92 to-[#143d32]/75" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <h2 id="home-final-cta-heading" className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
          Vaše cesta k lepšímu financování začíná tady.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
          Spočítejte si možnosti nebo nám nezávazně pošlete svou situaci.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href={routes.kalkulacky.hypotecniKalkulacka}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-[#143d32] hover:bg-white/90"
          >
            Spočítat možnosti
          </Link>
          <Link
            href={routes.kontakt}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/40 px-5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Nezávazná poptávka
          </Link>
        </div>
      </div>
    </section>
  );
}
