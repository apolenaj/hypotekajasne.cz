"use client";

import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="lg:hidden relative h-64 sm:h-80">
        <Image
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"
          alt="Luxusní vila s bazénem"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-0 lg:min-h-[520px]">
          <div className="hidden lg:block relative">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
              alt="Moderní interiér"
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="relative lg:flex lg:items-center">
            <div className="hidden lg:block absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"
                alt="Luxusní vila s bazénem"
                fill
                sizes="50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-deep-teal/70" />
            </div>

            <div className="relative z-10 py-12 lg:py-16 px-0 lg:px-12 xl:px-16">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark lg:text-white leading-tight mb-4 lg:mb-6">
                Získejte hypotéku jasně.
                <br />
                V Česku i v zahraničí.
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground lg:text-white/90 mb-8 max-w-lg leading-relaxed">
                Vypočítejte si splátky, porovnejte nabídky a získejte konzultaci od
                našich expertů.
              </p>
              <Link
                href={routes.kalkulacky.root}
                className="inline-flex items-center justify-center bg-deep-teal hover:bg-deep-teal-light active:scale-[0.98] text-white h-12 px-8 rounded-lg text-base font-medium transition-all duration-200"
              >
                Spočítat hypotéku
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
