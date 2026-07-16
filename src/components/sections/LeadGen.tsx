"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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

export function LeadGen() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lead Gen formulář – odeslaná data:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg text-center">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl ring-1 ring-deep-teal/20 shadow-xl p-10">
            <div className="w-14 h-14 rounded-2xl bg-deep-teal/10 flex items-center justify-center mx-auto mb-5">
              <Send className="w-6 h-6 text-deep-teal" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-deep-teal mb-3">
              Děkujeme za vaši poptávku!
            </h2>
            <p className="text-muted-foreground text-sm">
              Náš expert vás bude kontaktovat do 24 hodin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="konzultace" className="py-16 lg:py-20 relative scroll-mt-28">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-white" />

      <div className="container relative mx-auto px-4 lg:px-8 max-w-lg">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-text-dark mb-2">
            Chcete hypotéku vyřešit jasně?
          </h2>
          <p className="text-sm text-muted-foreground">
            Nezávazná konzultace s naším expertem
          </p>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-900/5 shadow-xl shadow-gray-900/10 p-6 lg:p-8">
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
                <SelectTrigger className="h-14 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/80">
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

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-deep-teal to-deep-teal-light hover:opacity-90 active:scale-[0.98] text-white rounded-xl text-base font-semibold mt-2 shadow-lg shadow-deep-teal/25 transition-all duration-200"
            >
              <Send className="w-4 h-4 mr-2" />
              Konzultovat s expertem
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
