import type { AcademyMediaBundle } from "@/lib/academy/types";
import { mediaStatusLabel } from "@/lib/i18n/labels";

export function AcademyMediaPlaceholders({
  media,
  lessonTitle,
}: {
  media: AcademyMediaBundle;
  lessonTitle: string;
}) {
  const videoPlanned = media.video.status !== "LIVE" || !media.video.src;
  const audioPlanned = media.audio.status !== "LIVE" || !media.audio.src;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-dashed border-border bg-[#f7f8f7] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Video (30–60 s)
          </p>
          <span className="rounded border border-stone-300 bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold">
            {mediaStatusLabel(media.video.status)}
          </span>
        </div>
        {videoPlanned ? (
          <div className="mt-3 flex aspect-video items-center justify-center rounded-lg bg-deep-teal/10 text-center text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-text-dark">{lessonTitle}</p>
              <p className="mt-1">
                Krátké video k této lekci připravujeme.
                <br />
                Plánovaná délka: {media.video.targetDurationSec?.min ?? 30}–
                {media.video.targetDurationSec?.max ?? 60} s
              </p>
            </div>
          </div>
        ) : (
          <video
            className="mt-3 aspect-video w-full rounded-lg"
            controls
            poster={media.video.poster ?? undefined}
            src={media.video.src!}
          >
            {media.video.captionsUrl ? (
              <track
                kind="captions"
                src={media.video.captionsUrl}
                srcLang="cs"
                label="Čeština"
              />
            ) : null}
          </video>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-[#f7f8f7] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Audio verze
          </p>
          <span className="rounded border border-stone-300 bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold">
            {mediaStatusLabel(media.audio.status)}
          </span>
        </div>
        {audioPlanned ? (
          <div className="mt-3 rounded-lg bg-white px-4 py-8 text-center text-xs text-muted-foreground">
            Audio verzi lekce připravujeme.
            <br />
            Přepis: {mediaStatusLabel(media.transcript?.status ?? "PLANNED")}
          </div>
        ) : (
          <audio className="mt-3 w-full" controls src={media.audio.src!} />
        )}
        {media.audio.transcript || media.transcript?.text ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {media.audio.transcript ?? media.transcript?.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
