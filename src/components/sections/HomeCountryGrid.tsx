import { UnifiedDestinationCards } from "@/components/sections/UnifiedDestinationCards";

export function HomeCountryGrid() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/5 via-white to-emerald-50/30" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-4 block">
            Investiční destinace
          </span>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-text-dark mb-4">
            Vyberte investiční destinaci
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Kalkulačka, tržní analýza, financování a průvodce články pro každý
            trh.
          </p>
        </div>

        <UnifiedDestinationCards />
      </div>
    </section>
  );
}
