"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import {
  desktopNav,
  mobileNavGroups,
  navCta,
  type NavLinkItem,
} from "@/lib/navigation";
import { useFocusTrap } from "@/lib/a11y/focus-trap";
import { loadReadiness } from "@/lib/mortgage-readiness/storage";
import { cn } from "@/lib/utils";

const ctaClassName = cn(
  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 px-4",
  "text-sm font-bold text-white shadow-md shadow-emerald-900/15",
  "transition-all hover:bg-emerald-700",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
);

function useHasReturningProfile() {
  return useSyncExternalStore(
    () => () => {},
    () => Boolean(loadReadiness()),
    () => false
  );
}

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
        <span className="inline-flex items-center gap-2">
          {item.label}
          <span className="sr-only"> (otevře se v novém okně)</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
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
  align = "left",
  className,
}: {
  label: string;
  items: NavLinkItem[];
  align?: "left" | "right";
  className?: string;
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
      className={cn("relative shrink-0", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-gray-600",
          "transition-colors hover:bg-deep-teal/5 hover:text-deep-teal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2",
          open && "bg-deep-teal/5 text-deep-teal"
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          className={cn(
            "absolute top-full z-[100] pt-1",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="max-h-[min(70vh,28rem)] w-max min-w-[12.5rem] max-w-[20rem] overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
            {items.map((item) => (
              <NavItemLink
                key={`${item.href}-${item.label}`}
                item={item}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <BrandWordmark
      href="/"
      onClick={onClick}
      compact
      showDomain={false}
      className="text-base sm:text-lg"
    />
  );
}

function HeaderCta({ className }: { className?: string }) {
  const returning = useHasReturningProfile();
  const cta = returning ? navCta.returning : navCta.default;
  return (
    <Link href={cta.href} className={cn(ctaClassName, className)}>
      {cta.label}
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenMobileGroup(null);
  }, []);

  useFocusTrap(mobileOpen, drawerRef, {
    onEscape: closeMobile,
    initialFocusRef: closeButtonRef,
  });

  return (
    <header
      data-site-header
      className="sticky top-0 z-50 w-full max-w-full border-b border-gray-100 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl min-w-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6 xl:px-8">
        <Logo />

        {/* Desktop from xl (1280+): grouped dropdowns — avoids overflow at 1024 / zoom 200% */}
        <nav
          className="ml-auto hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
          aria-label="Hlavní navigace"
        >
          <Link
            href={desktopNav.overview.href}
            className="inline-flex h-10 shrink-0 items-center rounded-lg px-2 text-sm font-semibold text-deep-teal transition-colors hover:bg-deep-teal/5"
          >
            {desktopNav.overview.label}
          </Link>

          <DesktopDropdown
            label={desktopNav.hypoteka.label}
            items={desktopNav.hypoteka.items}
          />
          <DesktopDropdown
            label={desktopNav.investice.label}
            items={desktopNav.investice.items}
          />
          <DesktopDropdown
            label={desktopNav.trhy.label}
            items={desktopNav.trhy.items}
          />

          <Link
            href={desktopNav.akademie.href}
            className="inline-flex h-10 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-gray-600 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal"
          >
            {desktopNav.akademie.label}
          </Link>

          <DesktopDropdown
            label={desktopNav.vice.label}
            items={[...desktopNav.vice.items]}
            align="right"
          />
        </nav>

        <div className="hidden shrink-0 items-center xl:flex">
          <HeaderCta />
        </div>

        {/* < xl: hamburger + compact CTA */}
        <div className="ml-auto flex shrink-0 items-center gap-2 xl:hidden">
          <HeaderCta className="hidden max-w-[10rem] truncate px-3 text-xs sm:inline-flex" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-deep-teal transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Otevřít menu"
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          ref={drawerRef}
          id="mobile-nav-drawer"
          className="fixed inset-0 z-[60] xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Zavřít menu"
            onClick={closeMobile}
            tabIndex={-1}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-4">
              <p
                id={drawerTitleId}
                className="font-heading text-base font-bold text-deep-teal"
              >
                Menu
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-deep-teal hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                onClick={closeMobile}
                aria-label="Zavřít menu"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <HeaderCta className="mb-4 w-full" />

              <Link
                href={desktopNav.overview.href}
                onClick={closeMobile}
                className="mb-3 flex min-h-11 items-center rounded-xl bg-deep-teal/5 px-4 text-sm font-semibold text-deep-teal"
              >
                {desktopNav.overview.label}
              </Link>

              <div className="space-y-2">
                {mobileNavGroups.map((group) => {
                  const isOpen = openMobileGroup === group.id;
                  return (
                    <div
                      key={group.id}
                      className="overflow-hidden rounded-xl border border-gray-100"
                    >
                      <button
                        type="button"
                        className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800"
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
                          aria-hidden
                        />
                      </button>
                      {isOpen ? (
                        <div className="space-y-0.5 border-t border-gray-100 px-2 py-2">
                          {group.items.map((item) => (
                            <NavItemLink
                              key={`${item.href}-${item.label}`}
                              item={item}
                              onClick={closeMobile}
                              className="flex min-h-11 items-center rounded-lg px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-deep-teal"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Pro unit testy breakpointové varianty Více — viz `@/lib/navigation` */
