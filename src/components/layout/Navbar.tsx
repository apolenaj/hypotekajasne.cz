"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import {
  isNavGroupActive,
  isNavItemActive,
  mobileNavGroups,
  navCta,
  primaryDesktopGroups,
  utilityNavItems,
  type NavGroup,
  type NavLinkItem,
} from "@/lib/navigation";
import { useFocusTrap } from "@/lib/a11y/focus-trap";
import { routes } from "@/lib/routes";
import {
  compactInlineCtaFits,
  desktopHeaderFits,
} from "@/lib/navigation/header-fit";
import { cn } from "@/lib/utils";

const ctaClassName = cn(
  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center rounded-lg bg-deep-teal px-4",
  "text-sm font-semibold text-white",
  "transition-colors hover:bg-deep-teal-light active:bg-[#143d32]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
);

const topLinkClass = (active: boolean) =>
  cn(
    "inline-flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2",
    active
      ? "bg-deep-teal/10 font-semibold text-deep-teal"
      : "text-gray-700 hover:bg-gray-50 hover:text-deep-teal"
  );

function useNavLocation() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  return { pathname, search: search ? `?${search}` : "" };
}

function NavItemLink({
  item,
  className,
  onClick,
  active,
  showDescription = false,
}: {
  item: NavLinkItem;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  showDescription?: boolean;
}) {
  const content =
    showDescription && item.description ? (
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium leading-snug">{item.label}</span>
        <span className="text-[13px] font-normal leading-snug text-gray-500">
          {item.description}
        </span>
      </span>
    ) : (
      item.label
    );

  const body = content;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        <span className="inline-flex items-start gap-2">
          {body}
          <span className="sr-only"> (otevře se v novém okně)</span>
          <ExternalLink
            className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60"
            aria-hidden
          />
        </span>
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      {body}
    </Link>
  );
}

function DesktopDirectLink({
  group,
  pathname,
  search,
}: {
  group: NavGroup;
  pathname: string;
  search: string;
}) {
  const href = group.href ?? group.items[0]?.href ?? routes.home;
  const active = isNavItemActive(href, pathname, search);
  return (
    <Link href={href} className={topLinkClass(active)} aria-current={active ? "page" : undefined}>
      {group.label}
    </Link>
  );
}

/**
 * Accessible disclosure megamenu (not APG menu).
 * Panel stays in the DOM so aria-controls always resolves.
 * Open state is controlled by the parent (one panel at a time).
 */
function DesktopDisclosure({
  group,
  pathname,
  search,
  open,
  onOpenChange,
}: {
  group: NavGroup;
  pathname: string;
  search: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const groupActive = isNavGroupActive(group, pathname, search);
  const columns = group.columns?.length
    ? group.columns
    : [{ items: group.items }];
  const colCount = Math.min(3, Math.max(1, columns.length));
  const alignEnd =
    group.id === "zahranici" || group.id === "pruvodci" || group.id === "o-nas";

  const close = useCallback(() => {
    onOpenChange(false);
    buttonRef.current?.focus();
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, onOpenChange]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        data-nav-disclosure={group.id}
        onClick={() => onOpenChange(!open)}
        className={cn(
          topLinkClass(groupActive || open),
          open && "bg-deep-teal/10 text-deep-teal"
        )}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "ml-1 h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        data-nav-panel={group.id}
        className={cn(
          "absolute top-full z-[200] pt-2",
          alignEnd ? "right-0" : "left-0"
        )}
      >
        <div
          className={cn(
            "max-h-[min(70vh,32rem)] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg",
            colCount === 1 && "w-[22rem] max-w-[min(22rem,92vw)]",
            colCount === 2 &&
              "grid w-[40rem] max-w-[min(40rem,92vw)] grid-cols-2 gap-x-8 gap-y-2",
            colCount === 3 &&
              "grid w-[46rem] max-w-[min(46rem,92vw)] grid-cols-3 gap-x-8 gap-y-2"
          )}
        >
          {columns.map((column, colIdx) => (
            <div key={column.title ?? `col-${colIdx}`} className="min-w-0">
              {column.title ? (
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {column.title}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {column.items.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <NavItemLink
                      item={item}
                      showDescription={Boolean(item.description)}
                      active={isNavItemActive(item.href, pathname, search)}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "block rounded-lg px-2.5 py-2.5 text-[15px] leading-snug text-gray-700 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                        isNavItemActive(item.href, pathname, search) &&
                          "bg-deep-teal/10 font-semibold text-deep-teal"
                      )}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <BrandWordmark
      href={routes.home}
      onClick={onClick}
      showDomain={false}
      rootClassName="shrink-0"
      className="whitespace-nowrap text-lg"
    />
  );
}

function HeaderCta({ className }: { className?: string }) {
  return (
    <Link href={navCta.default.href} className={cn(ctaClassName, className)}>
      Nezávazná poptávka →
    </Link>
  );
}

export function Navbar() {
  const { pathname, search } = useNavLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [openDesktopId, setOpenDesktopId] = useState<string | null>(null);
  const [desktopFits, setDesktopFits] = useState(false);
  const [inlineCta, setInlineCta] = useState(false);
  const [routeKey, setRouteKey] = useState(`${pathname}${search}`);
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navProbeRef = useRef<HTMLDivElement>(null);
  const ctaProbeRef = useRef<HTMLDivElement>(null);

  // Reset open disclosure when the route changes (render-time adjust, not an effect).
  const nextRouteKey = `${pathname}${search}`;
  if (nextRouteKey !== routeKey) {
    setRouteKey(nextRouteKey);
    setOpenDesktopId(null);
  }

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenMobileGroup(null);
  }, []);

  const measureHeader = useCallback(() => {
    const row = headerRowRef.current;
    const logo = logoRef.current;
    const nav = navProbeRef.current;
    const cta = ctaProbeRef.current;
    if (!row || !logo || !nav || !cta) return;
    const style = getComputedStyle(row);
    const paddingX =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const zoneGap = parseFloat(style.columnGap) || 16;
    const containerWidth = row.clientWidth;
    const logoWidth = logo.offsetWidth;
    const navWidth = nav.scrollWidth;
    const ctaWidth = cta.offsetWidth;
    const fits = desktopHeaderFits({
      containerWidth,
      logoWidth,
      navWidth,
      ctaWidth,
      paddingX,
      zoneGap,
    });
    const showInlineCta = compactInlineCtaFits({
      containerWidth,
      logoWidth,
      ctaWidth,
      menuButtonWidth: 44,
      paddingX,
      zoneGap,
    });
    setDesktopFits(fits);
    setInlineCta(showInlineCta);
  }, []);

  useLayoutEffect(() => {
    measureHeader();
    const row = headerRowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(() => measureHeader());
    observer.observe(row);
    const fonts = document.fonts;
    if (fonts?.ready) {
      void fonts.ready.then(() => measureHeader());
    }
    return () => observer.disconnect();
  }, [measureHeader]);

  useEffect(() => {
    if (desktopFits) {
      setMobileOpen(false);
      setOpenMobileGroup(null);
    } else {
      setOpenDesktopId(null);
    }
  }, [desktopFits]);

  useFocusTrap(mobileOpen, drawerRef, {
    onEscape: closeMobile,
    initialFocusRef: closeButtonRef,
  });

  return (
    <header
      data-site-header
      className="sticky top-0 z-[100] w-full max-w-full overflow-visible border-b border-gray-200 bg-white"
    >
      <div
        ref={headerRowRef}
        data-header-row
        className="relative mx-auto grid h-[72px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6"
      >
        <div ref={logoRef} className="shrink-0 justify-self-start">
          <Logo />
        </div>

        <nav
          className={cn(
            "flex min-w-0 items-center justify-center gap-x-2",
            desktopFits
              ? "overflow-visible"
              : "invisible pointer-events-none overflow-hidden"
          )}
          aria-label="Hlavní navigace"
          aria-hidden={!desktopFits}
          inert={!desktopFits}
          data-desktop-nav
          data-header-fit={desktopFits ? "desktop" : "compact"}
        >
          {primaryDesktopGroups.map((group) =>
            group.href ? (
              <DesktopDirectLink
                key={group.id}
                group={group}
                pathname={pathname}
                search={search}
              />
            ) : (
              <DesktopDisclosure
                key={group.id}
                group={group}
                pathname={pathname}
                search={search}
                open={openDesktopId === group.id}
                onOpenChange={(next) =>
                  setOpenDesktopId(next ? group.id : null)
                }
              />
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center justify-self-end gap-2">
          {desktopFits || inlineCta ? <HeaderCta /> : null}
          {desktopFits ? null : (
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-deep-teal transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label="Otevřít menu"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div
        ref={navProbeRef}
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[9999px] flex w-max items-center gap-x-2"
        data-measure-probe="nav"
      >
        {primaryDesktopGroups.map((group) => (
          <span key={group.id} className={topLinkClass(false)}>
            {group.label}
            {group.href ? null : (
              <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
          </span>
        ))}
      </div>
      <div
        ref={ctaProbeRef}
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[9999px]"
        data-measure-probe="cta"
      >
        <HeaderCta />
      </div>

      {mobileOpen ? (
        <div
          ref={drawerRef}
          id="mobile-nav-drawer"
          className="fixed inset-0 z-[130]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={closeMobile}
            tabIndex={-1}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl">
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

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
              <HeaderCta className="mb-4 w-full max-w-full" />

              <div className="space-y-2">
                {mobileNavGroups.map((group) => {
                  if (group.href) {
                    const active = isNavItemActive(group.href, pathname, search);
                    return (
                      <Link
                        key={group.id}
                        href={group.href}
                        onClick={closeMobile}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center rounded-xl border border-gray-100 px-4 text-sm font-semibold",
                          active ? "text-deep-teal" : "text-gray-800"
                        )}
                      >
                        {group.label}
                      </Link>
                    );
                  }
                  const isOpen = openMobileGroup === group.id;
                  const groupActive = isNavGroupActive(
                    group,
                    pathname,
                    search
                  );
                  const panelId = `mobile-nav-${group.id}`;
                  return (
                    <div
                      key={group.id}
                      className="overflow-hidden rounded-xl border border-gray-100"
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex min-h-11 w-full max-w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold",
                          groupActive ? "text-deep-teal" : "text-gray-800"
                        )}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenMobileGroup(isOpen ? null : group.id)
                        }
                      >
                        <span className="min-w-0 truncate">{group.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-gray-400 transition-transform",
                            isOpen && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                      <div
                        id={panelId}
                        hidden={!isOpen}
                        className="max-h-[min(50vh,20rem)] space-y-0.5 overflow-y-auto overflow-x-hidden border-t border-gray-100 px-2 py-2"
                      >
                        {group.items.map((item) => (
                          <NavItemLink
                            key={`${item.href}-${item.label}`}
                            item={item}
                            showDescription={Boolean(item.description)}
                            active={isNavItemActive(
                              item.href,
                              pathname,
                              search
                            )}
                            onClick={closeMobile}
                            className={cn(
                              "flex min-h-11 w-full max-w-full items-start rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-deep-teal",
                              isNavItemActive(item.href, pathname, search) &&
                                "bg-deep-teal/10 font-semibold text-deep-teal"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <nav
                aria-label="Sekundární navigace"
                className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-4"
              >
                {utilityNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className="text-sm text-gray-600 hover:text-deep-teal"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
