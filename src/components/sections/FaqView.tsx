"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/faq/items";
import { cn } from "@/lib/utils";

export function FaqView() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <div className="flex items-center gap-3 text-emerald-200">
            <HelpCircle className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Časté otázky
            </span>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-black md:text-5xl">
            Nejčastější dotazy
          </h1>
          <p className="mt-4 text-lg text-emerald-50/90">
            Role platformy, model vs. banka a transparentní odměna — detail v
            Centru důvěry.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  aria-expanded={open}
                >
                  <span className="font-bold text-gray-900">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-deep-teal transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>
                {open && (
                  <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:text-base">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
