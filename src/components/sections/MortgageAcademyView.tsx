"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Baby,
  Building2,
  BookOpen,
  Lightbulb,
  LineChart,
} from "lucide-react";
import {
  academyLessons,
  type AcademyLesson,
} from "@/lib/mortgage-academy";
import { cn } from "@/lib/utils";

function LessonCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0" />
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
        {children}
      </p>
    </div>
  );
}

function LessonContent({ lesson }: { lesson: AcademyLesson }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Lekce akademie
        </p>
        <h2 className="mt-2 font-heading text-3xl font-black text-gray-900">
          {lesson.title}
        </h2>
      </div>

      <LessonCard
        title="Jak to vysvětlit dítěti"
        icon={Lightbulb}
        className="border-amber-200 bg-amber-50 text-amber-950"
      >
        {lesson.definition}
      </LessonCard>

      <LessonCard
        title="Na reálném příkladu"
        icon={LineChart}
        className="border-sky-200 bg-sky-50 text-sky-950"
      >
        {lesson.realExample}
      </LessonCard>

      <LessonCard
        title="Co na to banka"
        icon={Building2}
        className="border-gray-200 bg-gray-100 text-gray-900"
      >
        {lesson.bankView}
      </LessonCard>

      <LessonCard
        title="Pozor na tuto chybu"
        icon={AlertTriangle}
        className="border-red-200 bg-red-50 text-red-950"
      >
        {lesson.commonMistake}
      </LessonCard>
    </div>
  );
}

export function MortgageAcademyView() {
  const [activeId, setActiveId] = useState(academyLessons[0].id);
  const activeLesson =
    academyLessons.find((l) => l.id === activeId) ?? academyLessons[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex items-center gap-3 text-emerald-200">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Vzdělávací hub
            </span>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-black md:text-5xl">
            Hypoteční akademie
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-emerald-50/90">
            Složité bankovní termíny do lidštiny — s příklady, pohledem banky a
            chybami, které stojí peníze. Budujte důvěru v čísla, ne v žargon.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Levý panel — sticky menu */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 sm:p-5">
              <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Pojmy
              </p>
              <nav className="flex flex-col gap-1" aria-label="Lekce akademie">
                {academyLessons.map((lesson) => {
                  const active = lesson.id === activeId;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveId(lesson.id)}
                      className={cn(
                        "rounded-xl px-3 py-3 text-left text-sm font-bold transition-all",
                        active
                          ? "bg-emerald-900 text-white shadow-md"
                          : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
                      )}
                    >
                      <span className="block">{lesson.shortLabel}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs font-medium",
                          active ? "text-emerald-100" : "text-muted-foreground"
                        )}
                      >
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-xs leading-relaxed text-emerald-900">
                <Baby className="mb-1 inline h-3.5 w-3.5" /> Tip: Začněte LTV a
                RPSN — to jsou dva pojmy, které rozhodují o první nabídce banky.
              </div>
            </div>
          </aside>

          {/* Pravý panel — obsah lekce */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5 sm:p-8 md:p-10">
              <LessonContent lesson={activeLesson} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
