import Link from "next/link";
import { Home, Mail, MapPin, Phone } from "lucide-react";
import { footerLinks, siteContact } from "@/lib/mock-data";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-deep-teal text-white">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-heading text-lg font-semibold text-deep-teal">
                HypotékaJasně.cz
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nezávislý informační portál a technologická platforma. Nejsme
              poskytovatelé finančních služeb ani licencovaní poradci –
              propojujeme vás s prověřenými experty.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-dark mb-4">
              Právní informace
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-deep-teal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-dark mb-4">Společnost</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-deep-teal transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-dark mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href={siteContact.emailHref}
                  className="inline-flex items-center gap-2 hover:text-deep-teal transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {siteContact.email}
                </a>
              </li>
              <li>
                <a
                  href={siteContact.phoneHref}
                  className="inline-flex items-center gap-2 hover:text-deep-teal transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {siteContact.phone}
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{siteContact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HypotékaJasně.cz. Všechna práva
            vyhrazena.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md">
            Informační a technologická platforma — nejsme banka ani licencovaný
            poradce.
          </p>
        </div>
      </div>
    </footer>
  );
}
