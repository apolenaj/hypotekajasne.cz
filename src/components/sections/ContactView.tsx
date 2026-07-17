"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";
import { siteContact } from "@/lib/mock-data";
import { buildThankYouPath, submitLead } from "@/lib/leads";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export function ContactView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");
    const message = String(data.get("message") ?? "");

    const result = await submitLead({
      name,
      email,
      phone,
      source: "contact",
      notes: message,
      metadata: { message },
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(buildThankYouPath("contact"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
            Kontakt
          </p>
          <h1 className="mt-3 font-heading text-3xl font-black md:text-5xl">
            Ozvěte se nám
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-50/90">
            Máte dotaz k fungování platformy nebo se chcete stát naším
            partnerem? Napište nám.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Telefon
              </p>
              <a
                href={siteContact.phoneHref}
                className="mt-2 block font-heading text-3xl font-black text-deep-teal hover:underline sm:text-4xl"
              >
                {siteContact.phone}
              </a>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
                E-mail
              </p>
              <a
                href={siteContact.emailHref}
                className="mt-2 inline-flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-deep-teal sm:text-2xl"
              >
                <Mail className="h-5 w-5" />
                {siteContact.email}
              </a>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Adresa
              </p>
              <p className="mt-2 flex items-start gap-2 text-lg text-gray-800">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-deep-teal" />
                {siteContact.address}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
              Hypotéka Jasně je informační platforma. Neposkytujeme hypotéky ani
              licencované poradenství — propojujeme vás s ověřenými experty.
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5 sm:p-8">
            <h2 className="text-xl font-black text-gray-900">Napište zprávu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Odpovíme co nejdříve na uvedený e-mail nebo telefon.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Jméno
                </span>
                <input
                  required
                  name="name"
                  type="text"
                  className={inputClass}
                  placeholder="Jan Novák"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  E-mail
                </span>
                <input
                  required
                  name="email"
                  type="email"
                  className={inputClass}
                  placeholder="jan@email.cz"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Telefon
                </span>
                <input
                  required
                  name="phone"
                  type="tel"
                  className={inputClass}
                  placeholder="+420 777 123 456"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Zpráva
                </span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  className={inputClass}
                  placeholder="Váš dotaz…"
                />
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? "Odesílám…" : "Odeslat zprávu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
