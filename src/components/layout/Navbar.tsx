"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Home, Menu, X } from "lucide-react";
import {
  primaryNavLinks,
  secondaryNavGroups,
  type NavLinkItem,
} from "@/lib/mock-data";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const middleNavGroups = secondaryNavGroups.filter(
  (g) => g.id === "nastroje" || g.id === "trhy" || g.id === "akademie"
);
const aboutNavGroup = secondaryNavGroups.find((g) => g.id === "o-nas");

const ctaClassName = cn(
  "inline-flex items-center justify-center rounded-full bg-emerald-800 px-6 py-2.5",
  "text-sm font-bold whitespace-nowrap text-white shadow-md shadow-emerald-900/15",
  "transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
);

function NavItemLink({
  item,
  className,
  onClick,
}: {
  item: NavLinkItem;
  className?: string;
  onClick?: () => void;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        <span className="flex items-center gap-2 whitespace-nowrap">
          {item.label}
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </span>
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

function DesktopDropdown({
  label,
  items,
}: {
  label: string;
  items: NavLinkItem[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap text-gray-600",
          "transition-colors hover:text-deep-teal",
          open && "text-deep-teal"
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full left-0 z-[100] pt-2"
        >
          <div className="min-w-[14rem] rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
            {items.map((item) => (
              <NavItemLink
                key={`${item.href}-${item.label}`}
                item={item}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm whitespace-nowrap text-gray-700 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setOpenMobileGroup(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full overflow-visible border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl overflow-visible px-4 sm:px-6 lg:px-8">
        {/* Desktop: 3 pevné bloky */}
        <div className="hidden h-20 w-full items-center justify-between gap-8 overflow-visible xl:flex">
          {/* LEVÝ BLOK — Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-deep-teal text-white">
                <Home className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold whitespace-nowrap text-deep-teal">
                HypotékaJasně.cz
              </span>
            </Link>
          </div>

          {/* STŘEDNÍ BLOK — Hlavní menu */}
          <nav
            className="flex items-center gap-6 overflow-visible"
            aria-label="Hlavní navigace"
          >
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold whitespace-nowrap text-deep-teal transition-colors hover:text-emerald-800"
              >
                {link.label}
              </Link>
            ))}

            <span className="h-5 w-px flex-shrink-0 bg-gray-200" aria-hidden />

            {middleNavGroups.map((group) => (
              <DesktopDropdown
                key={group.id}
                label={group.label}
                items={group.items}
              />
            ))}
          </nav>

          {/* PRAVÝ BLOK — O nás + CTA */}
          <div className="flex flex-shrink-0 items-center gap-6 overflow-visible">
            {aboutNavGroup && (
              <DesktopDropdown
                label={aboutNavGroup.label}
                items={aboutNavGroup.items}
              />
            )}
            <Link href={routes.navrhNaMiru} className={ctaClassName}>
              Návrh na míru
            </Link>
          </div>
        </div>

        {/* Mobile / tablet bar */}
        <div className="flex h-16 w-full items-center justify-between gap-4 xl:hidden">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={closeMobile}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-deep-teal text-white">
                <Home className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold whitespace-nowrap text-deep-teal">
                HypotékaJasně.cz
              </span>
            </Link>
          </div>

          <div className="flex flex-shrink-0 items-center gap-3">
            <Link
              href={routes.navrhNaMiru}
              className={cn(ctaClassName, "hidden sm:inline-flex")}
            >
              Návrh na míru
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-deep-teal transition-colors hover:bg-gray-50"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Zavřít menu" : "Otevřít menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white xl:hidden">
          <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6">
            <Link
              href={routes.navrhNaMiru}
              onClick={closeMobile}
              className={cn(ctaClassName, "w-full")}
            >
              Návrh na míru
            </Link>

            <div>
              <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Kam dál
              </p>
              <div className="flex flex-col gap-2">
                {primaryNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="rounded-xl bg-deep-teal/5 px-4 py-3 text-sm font-semibold whitespace-nowrap text-deep-teal transition-colors hover:bg-deep-teal/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {secondaryNavGroups.map((group) => {
                const isOpen = openMobileGroup === group.id;
                return (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-xl border border-gray-100"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-gray-800"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenMobileGroup(isOpen ? null : group.id)
                      }
                    >
                      {group.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-gray-400 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="space-y-1 border-t border-gray-100 px-2 py-2">
                        {group.items.map((item) => (
                          <NavItemLink
                            key={`${item.href}-${item.label}`}
                            item={item}
                            onClick={closeMobile}
                            className="block rounded-lg px-3 py-2.5 text-sm whitespace-nowrap text-gray-600 transition-colors hover:bg-gray-50 hover:text-deep-teal"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
