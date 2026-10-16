import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const PERSON_PROFILE_PHOTO_PX = 160;

type PersonProfileCardProps = {
  name: string;
  role: string;
  photoUrl: string;
  photoAlt: string;
  photoWidth: number;
  photoHeight: number;
  /** CSS object-position for face framing inside the circle. */
  photoObjectPosition?: string;
  /** Optional small label above the name (e.g. partner eyebrow). */
  eyebrow?: string;
  paragraphs: readonly string[];
  /** Secondary block under the bio (education, specializations, …). */
  footer?: ReactNode;
  nameAs?: "h2" | "h3";
  priority?: boolean;
  className?: string;
};

/**
 * Shared people-card shell for /o-nas (and similar trust surfaces).
 * Keeps photo + name row aligned across equal-width columns.
 */
export function PersonProfileCard({
  name,
  role,
  photoUrl,
  photoAlt,
  photoWidth,
  photoHeight,
  photoObjectPosition = "center 18%",
  eyebrow,
  paragraphs,
  footer,
  nameAs = "h3",
  priority = false,
  className,
}: PersonProfileCardProps) {
  const NameTag = nameAs;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div
          className="relative size-40 shrink-0 overflow-hidden rounded-full border border-border/70 bg-slate-100 shadow-[0_6px_18px_-10px_rgba(15,23,42,0.35)]"
          style={{ width: PERSON_PROFILE_PHOTO_PX, height: PERSON_PROFILE_PHOTO_PX }}
        >
          <Image
            src={photoUrl}
            alt={photoAlt}
            width={photoWidth}
            height={photoHeight}
            className="h-full w-full object-cover"
            style={{ objectPosition: photoObjectPosition }}
            sizes={`${PERSON_PROFILE_PHOTO_PX}px`}
            priority={priority}
          />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          {/* Reserved eyebrow row keeps names level across side-by-side cards. */}
          <p
            className={cn(
              "mb-1.5 min-h-[1rem] text-[0.7rem] font-bold tracking-[0.14em] text-deep-teal uppercase",
              !eyebrow && "invisible select-none"
            )}
            aria-hidden={!eyebrow}
          >
            {eyebrow ?? "\u00a0"}
          </p>
          <NameTag className="font-heading text-xl font-bold tracking-tight text-text-dark md:text-2xl">
            {name}
          </NameTag>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-deep-teal">
            {role}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>

      {footer ? <div className="mt-auto pt-5">{footer}</div> : null}
    </article>
  );
}
