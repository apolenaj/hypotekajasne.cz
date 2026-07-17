"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { consultationCountries } from "@/lib/mock-data";
import { buildThankYouPath, submitLead } from "@/lib/leads";

export function LeadGen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const countryLabel =
      consultationCountries.find((c) => c.value === formData.country)?.label ||
      formData.country;

    const result = await submitLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: "lead_gen",
      country: countryLabel || undefined,
      notes: countryLabel
        ? `Zájem o konzultaci: ${countryLabel}`
        : "Obecná konzultace",
      metadata: {
        country_code: formData.country || null,
      },
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(buildThankYouPath("lead_gen"));
  };

  return (
    <section id="konzultace" className="relative scroll-mt-28 py-16 lg:py-20">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-white" />

      <div className="container relative mx-auto max-w-lg px-4 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-heading mb-2 text-2xl font-bold text-text-dark lg:text-3xl">
            Chcete hypotéku vyřešit jasně?
          </h2>
          <p className="text-sm text-muted-foreground">
            Nezávazná konzultace s naším expertem
          </p>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/5 backdrop-blur-xl lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput
              id="name"
              label="Jméno"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              required
            />
            <FloatingInput
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
              required
            />
            <FloatingInput
              id="phone"
              label="Telefon"
              type="tel"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
              required
            />

            <div className="space-y-2">
              <Select
                value={formData.country}
                onValueChange={(v) => {
                  if (v) setFormData({ ...formData, country: v });
                }}
              >
                <SelectTrigger className="h-14 rounded-xl border-gray-200/80 bg-white/60 backdrop-blur-sm">
                  <SelectValue placeholder="Zájem o konzultaci" />
                </SelectTrigger>
                <SelectContent>
                  {consultationCountries.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-deep-teal to-deep-teal-light text-base font-semibold text-white shadow-lg shadow-deep-teal/25 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {loading ? "Odesílám…" : "Konzultovat s expertem"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
