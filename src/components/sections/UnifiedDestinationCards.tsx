import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { unifiedDestinations } from "@/lib/unified-destinations";
import { routes } from "@/lib/routes";

interface UnifiedDestinationCardsProps {
  linkLabel?: string;
  cardClassName?: string;
}

export function UnifiedDestinationCards({
  linkLabel = "Prozkoumat trh",
  cardClassName = "h-56 sm:h-60 lg:h-72",
}: UnifiedDestinationCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {unifiedDestinations.map((item, idx) => (
        <Link
          key={`${item.country}-${idx}`}
          href={`${routes.pruvodceInvestora}/${item.slug}`}
          className={`group relative w-full rounded-3xl overflow-hidden ring-1 ring-gray-900/10 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] ${cardClassName}`}
        >
          <img
            src={item.image}
            alt={item.country}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6">
            <h3 className="text-xl font-bold text-white mb-2">{item.country}</h3>
            <p className="text-sm text-gray-200 line-clamp-2">{item.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-emerald-300 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {linkLabel}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
