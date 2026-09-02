"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { LegalOperatorIdentity } from "@/components/legal/LegalOperatorIdentity";
import { useCookieConsent } from "@/components/consent/CookieConsentProvider";
import { trackEvent } from "@/lib/analytics/track-event";
import { SITE_DOMAIN_LABEL } from "@/lib/brand";
import { getRegulatoryFooterLine, getCooperationWordingNeutral } from "@/lib/legal/regulatory-texts";
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

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h4 className="mb-3 font-semibold text-text-dark">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 lg:gap-10">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <BrandWordmark href="/" showDomain className="text-lg font-semibold" />
            <LegalOperatorIdentity
              variant="compact"
              showContact={false}
              showRegister
              className="text-xs leading-relaxed"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {getCooperationWordingNeutral("cs")}
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href={siteContact.emailHref}
                  onClick={() => {
                    trackEvent("email_click", {
                      source_page:
                        typeof window !== "undefined"
                          ? window.location.pathname
                          : undefined,
                      placement: "footer",
                    });
                  }}
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
                    onClick={() => {
                      trackEvent("phone_click", {
                        source_page:
                          typeof window !== "undefined"
                            ? window.location.pathname
                            : undefined,
                        placement: "footer",
                      });
                    }}
                    className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {siteContact.phone}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <FooterColumn title="Hypotéky" links={footerLinks.hypoteky} />
          <FooterColumn title="Investice" links={footerLinks.investice} />
          <FooterColumn title="Zahraničí" links={footerLinks.zahranici} />
          <FooterColumn title="Nástroje" links={footerLinks.nastroje} />
          <FooterColumn title="Průvodci" links={footerLinks.pruvodci} />
          <FooterColumn title="Společnost" links={footerLinks.company} />

          <div>
            <h4 className="mb-3 font-semibold text-text-dark">
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
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hypotéka Jasně ·{" "}
            <span className="text-xs text-muted-foreground/80">
              {SITE_DOMAIN_LABEL}.
            </span>{" "}
            Všechna práva vyhrazena.
          </p>
          <p className="max-w-md text-center text-xs text-muted-foreground sm:text-right">
            {getRegulatoryFooterLine("cs")}
          </p>
        </div>
      </div>
    </footer>
  );
}
