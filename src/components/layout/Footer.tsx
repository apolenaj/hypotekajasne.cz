"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LegalOperatorIdentity } from "@/components/legal/LegalOperatorIdentity";
import { useCookieConsent } from "@/components/consent/CookieConsentProvider";
import { SITE_DOMAIN_LABEL } from "@/lib/brand";
import { financialPartner } from "@/config/legal";
import { footerLinks, siteContact } from "@/lib/mock-data";

function CookieSettingsLink() {
  const { reopenPreferences } = useCookieConsent();
  return (
    <button
      type="button"
      onClick={reopenPreferences}
      className="text-sm text-muted-foreground transition-colors hover:text-deep-teal"
    >
      Nastavení cookies
    </button>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <BrandWordmark href="/" showDomain className="text-lg font-semibold" />
            <LegalOperatorIdentity
              variant="compact"
              showContact={false}
              showRegister
              className="text-xs leading-relaxed"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {financialPartner.cooperationWording}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-text-dark">
              Právní informace
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-deep-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsLink />
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-text-dark">Společnost</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-deep-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-text-dark">Kontakt</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href={siteContact.emailHref}
                  className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {siteContact.email}
                </a>
              </li>
              {siteContact.phone ? (
                <li>
                  <a
                    href={siteContact.phoneHref}
                    className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {siteContact.phone}
                  </a>
                  <p className="mt-1 pl-6 text-[11px] text-muted-foreground/80">
                    Kontakt projektu Hypotéka Jasně
                  </p>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hypotéka Jasně ·{" "}
            <span className="text-xs text-muted-foreground/80">
              {SITE_DOMAIN_LABEL}
            </span>
            . Všechna práva vyhrazena.
          </p>
          <p className="max-w-md text-center text-xs text-muted-foreground sm:text-right">
            Informační platforma — nejsme banka. Schválení úvěru vždy provádí
            banka po vlastním posouzení.
          </p>
        </div>
      </div>
    </footer>
  );
}
