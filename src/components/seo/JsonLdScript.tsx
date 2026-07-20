import type { JsonLd } from "@/lib/seo/json-ld";

/** Server-safe JSON-LD script — only for schemas matching visible content. */
export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
