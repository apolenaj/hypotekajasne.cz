"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { destinationCards } from "@/lib/mock-data";
import type { CountryId } from "@/lib/calculators";
import { cn } from "@/lib/utils";
import { CountryDetailView } from "@/components/sections/CountryDetailView";
import { CountryInvestmentHub } from "@/components/sections/CountryInvestmentHub";

interface InvestmentGoalsProps {
  selectedCard: CountryId;
  selectedCountry: CountryId;
  onSelectCard: (cardId: CountryId) => void;
}

export function DestinationCardButton({
  card,
  isActive,
  onSelect,
}: {
  card: (typeof destinationCards)[number];
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        "group relative h-56 sm:h-60 lg:h-64 w-full rounded-3xl overflow-hidden text-left",
        "transition-all duration-500 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "hover:shadow-2xl hover:shadow-emerald-500/20",
        isActive
          ? "ring-2 ring-emerald-500 ring-offset-2 shadow-2xl shadow-emerald-500/25 scale-[1.02]"
          : "ring-1 ring-gray-900/10 shadow-lg shadow-gray-900/10"
      )}
    >
      <div className="absolute inset-0 overflow-hidden bg-gray-800">
        <Image
          src={card.image}
          alt={card.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={card.id === "cz" || card.id === "dubai"}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {isActive && (
        <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-end items-start p-6 text-left">
        <h3 className="text-white font-bold text-lg lg:text-xl leading-tight mb-1.5 drop-shadow-md">
          {card.name}
        </h3>
        <p className="text-white text-sm leading-relaxed drop-shadow-md opacity-90">
          {card.subtitle}
        </p>
      </div>
    </button>
  );
}

export function InvestmentGoals({
  selectedCard,
  selectedCountry,
  onSelectCard,
}: InvestmentGoalsProps) {
  return (
    <section
      id="zahranicni"
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/5 via-white to-emerald-50/30" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark">
            Vyberte si svůj investiční cíl
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {destinationCards.map((card) => (
            <DestinationCardButton
              key={card.id}
              card={card}
              isActive={selectedCard === card.id}
              onSelect={() => onSelectCard(card.id)}
            />
          ))}
        </div>

        <CountryInvestmentHub key={`hub-${selectedCountry}`} countryId={selectedCountry} />

        <CountryDetailView key={selectedCountry} country={selectedCountry} />
      </div>
    </section>
  );
}
