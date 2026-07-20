"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import { submitLead } from "@/lib/leads";

export function MagazineNewsletterCta() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(() => emptyFormConsentState("none"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    const result = await submitLead({
      name: "Novinky e-mailem",
      email: email.trim(),
      source: "newsletter",
      notes: "Novinky e-mailem — Magazín",
      metadata: { channel: "magazine_newsletter" },
      consent: toConsentRecord(consent, "/clanky"),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="rounded-2xl bg-deep-teal px-6 py-10 text-center text-white sm:px-10">
      <Mail className="mx-auto h-8 w-8 text-muted-gold" />
      <h2 className="mt-4 font-heading text-2xl font-bold">Novinky e-mailem</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
        Jednou měsíčně: sazby, regulace, zahraniční financování. Bez spamových
        „tipů na zbohatnutí“. Vyžaduje výslovný marketingový souhlas.
      </p>
      {submitted ? (
        <p className="mt-6 text-sm font-semibold text-muted-gold">
          Díky — jste přihlášeni.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex max-w-lg flex-col gap-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="flex-1 rounded-lg px-4 py-3 text-sm text-text-dark"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 py-3 text-sm font-bold text-[#0b3d3a] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Odebírat
            </button>
          </div>
          <FormConsentFields
            state={consent}
            onChange={setConsent}
            showPartnerTransfer={false}
            marketingRequired
            className="space-y-3 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-left text-xs leading-relaxed text-white/90 sm:text-sm"
          />
        </form>
      )}
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}
