/**
 * AI / answer-engine readiness primitives.
 * Visible HTML only — no proprietary „AI schema“.
 */

export function DefinitionTerm({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <dl className="rounded-xl border border-border bg-[#f7f8f7] px-4 py-3">
      <dt className="font-heading text-base font-bold text-text-dark">{term}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {children}
      </dd>
    </dl>
  );
}

export function ExtractableTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
        <caption className="border-b border-border bg-[#f7f8f7] px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-3 py-2 font-semibold text-text-dark"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SourceBackedFact({
  fact,
  sourceLabel,
  sourceUrl,
}: {
  fact: string;
  sourceLabel: string;
  sourceUrl?: string;
}) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      <span className="text-text-dark">{fact}</span>{" "}
      <span className="text-xs">
        (zdroj:{" "}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            className="text-deep-teal underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {sourceLabel}
          </a>
        ) : (
          sourceLabel
        )}
        )
      </span>
    </p>
  );
}

export function VideoTranscript({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section
      aria-labelledby="video-transcript-heading"
      className="rounded-xl border border-border px-4 py-4"
    >
      <h2
        id="video-transcript-heading"
        className="font-heading text-lg font-semibold text-text-dark"
      >
        Přepis: {title}
      </h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
    </section>
  );
}
