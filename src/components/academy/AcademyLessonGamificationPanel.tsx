"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
  getLessonToolBridge,
  loadAcademyProgressStore,
  markLessonRead,
  saveAcademyProgressStore,
} from "@/lib/academy/gamification";

export function AcademyLessonGamificationPanel({ lessonSlug }: { lessonSlug: string }) {
  const bridge = getLessonToolBridge(lessonSlug);

  useEffect(() => {
    const store = loadAcademyProgressStore();
    const next = markLessonRead(store, lessonSlug);
    saveAcademyProgressStore(next);
  }, [lessonSlug]);

  if (!bridge) return null;

  return (
    <section className="mt-8 rounded-2xl border-2 border-deep-teal/30 bg-[#eef3f1] p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
        Vzdělávání → nástroj → váš výsledek
      </p>
      <h2 className="mt-2 font-heading text-lg font-bold">Co dál?</h2>
      <p className="mt-1 text-sm text-muted-foreground">{bridge.description}</p>
      <Link
        href={bridge.href}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-bold text-white"
      >
        {bridge.label}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
