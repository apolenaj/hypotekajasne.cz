"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, ExternalLink, Home, Menu, X } from "lucide-react";
import { expertNavLinks, mainNavLinks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 flex-nowrap">
          {/* Blok 1 — Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-deep-teal text-white">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-heading text-lg font-bold text-deep-teal whitespace-nowrap">
                HypotékaJasně.cz
              </span>
            </Link>
          </div>

          {/* Blok 2 — Odkazy uprostřed */}
          <nav className="hidden lg:flex items-center justify-center gap-5 flex-1 px-8">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-emerald-700 whitespace-nowrap transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Blok 3 — Akční tlačítka vpravo */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <a
              href="https://majetio.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-all border border-emerald-200 whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              Majetio.cz
            </a>
            <Link
              href="/navrh-na-miru"
              className="inline-flex items-center gap-2 bg-emerald-900 text-white text-sm px-5 py-2.5 rounded-full font-bold hover:bg-emerald-800 transition-colors shadow-md whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              Návrh na míru
            </Link>
          </div>

          {/* Mobilní hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 text-deep-teal"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Zavřít menu" : "Otevřít menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Expertní lišta — jeden řádek */}
      <div className="hidden lg:block bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 h-11 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {expertNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-emerald-700 whitespace-nowrap transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobilní menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Hlavní navigace
              </p>
              <div className="flex flex-col gap-3">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-gray-700 hover:text-emerald-700 whitespace-nowrap transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Expertní navigace
              </p>
              <div className="flex flex-col gap-3">
                {expertNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-emerald-700 whitespace-nowrap transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://majetio.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-full border border-emerald-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ExternalLink className="w-4 h-4" />
                Majetio.cz
              </a>
              <Link
                href="/navrh-na-miru"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full",
                  "text-sm font-bold transition-colors shadow-md"
                )}
              >
                <ClipboardList className="w-5 h-5" />
                Návrh na míru
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
