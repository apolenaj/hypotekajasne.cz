"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
import { loadReadiness } from "@/lib/mortgage-readiness/storage";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const ctaClassName = cn(
  "inline-flex h-10 min-h-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 px-4",
  "text-sm font-bold text-white shadow-md shadow-emerald-900/15",
  "transition-all hover:bg-emerald-700 active:bg-emerald-900",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
);

const topLinkClass = (active: boolean) =>
  cn(
    "inline-flex h-10 shrink-0 items-center rounded-lg px-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2",
    active
      ? "bg-deep-teal/10 font-semibold text-deep-teal"
      : "text-gray-600 hover:bg-deep-teal/5 hover:text-deep-teal"
  );

function useHasReturningProfile() {
  return useSyncExternalStore(
    () => () => {},
    () => Boolean(loadReadiness()),
    () => false
  );
}

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
  const content = showDescription && item.description ? (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="font-medium leading-snug">{item.label}</span>
      <span className="text-xs font-normal leading-snug text-gray-500">
        {item.description}
      </span>
    </span>
  ) : (
    item.label
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
        role="menuitem"
      >
        <span className="inline-flex items-start gap-2">
          {content}
          <span className="sr-only"> (otevře se v novém okně)</span>
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        </span>
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      onClick={onClick}
      role="menuitem"
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

function DesktopMegaMenu({
  group,
  pathname,
  search,
}: {
  group: NavGroup;
  pathname: string;
  search: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const groupActive = isNavGroupActive(group, pathname, search);
  const columns = group.columns?.length
    ? group.columns
    : [{ items: group.items }];
  const colCount = Math.min(3, Math.max(1, columns.length));

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const links = menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      );
      if (!links?.length) return;
      event.preventDefault();
      const list = [...links];
      const idx = list.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === "ArrowDown"
          ? list[(idx + 1 + list.length) % list.length]
          : list[(idx - 1 + list.length) % list.length];
      next?.focus();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          topLinkClass(groupActive),
          open && "bg-deep-teal/5 text-deep-teal"
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

      {open ? (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label={group.label}
          className="absolute left-1/2 top-full z-[100] w-[min(36rem,90%)] -translate-x-1/2 pt-1 xl:left-0 xl:w-auto xl:min-w-[28rem] xl:max-w-[36rem] xl:translate-x-0"
        >
          <div
            className={cn(
              "max-h-[min(70vh,32rem)] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-lg",
              colCount === 1 && "w-max min-w-[14rem] max-w-[22rem]",
              colCount === 2 && "grid grid-cols-2 gap-3",
              colCount === 3 && "grid grid-cols-3 gap-3"
            )}
          >
            {columns.map((column, colIdx) => (
              <div key={column.title ?? `col-${colIdx}`} className="min-w-0">
                {column.title ? (
                  <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {column.title}
                  </p>
                ) : null}
                <div className="space-y-0.5">
                  {column.items.map((item) => (
                    <NavItemLink
                      key={`${item.href}-${item.label}`}
                      item={item}
                      showDescription={Boolean(item.description)}
                      active={isNavItemActive(item.href, pathname, search)}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg px-2.5 py-2 text-sm text-gray-700 transition-colors hover:bg-deep-teal/5 hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                        isNavItemActive(item.href, pathname, search) &&
                          "bg-deep-teal/10 font-semibold text-deep-teal"
                      )}
                    />
                  ))}
                </div>
              </div>
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
      href={routes.home}
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
  const { pathname, search } = useNavLocation();

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenMobileGroup(null);
  }, []);

  useFocusTrap(mobileOpen, drawerRef, {
    onEscape: closeMobile,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <header
      data-site-header
      className="sticky top-0 z-50 w-full max-w-full border-b border-gray-100 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto hidden max-w-7xl items-center justify-end gap-4 px-4 pt-1.5 text-xs text-gray-500 lg:px-6 xl:flex xl:px-8">
        <nav aria-label="Sekundární navigace" className="flex items-center gap-3">
          {utilityNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded px-1 py-0.5 transition-colors hover:text-deep-teal",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
                isNavItemActive(item.href, pathname, search) &&
                  "font-semibold text-deep-teal"
              )}
              aria-current={
                isNavItemActive(item.href, pathname, search) ? "page" : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex h-14 w-full max-w-7xl min-w-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6 xl:px-8">
        <Logo />

        <nav
          className="ml-auto hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex 2xl:gap-1"
          aria-label="Hlavní navigace"
        >
          {primaryDesktopGroups.map((group) => (
            <DesktopMegaMenu
              key={group.id}
              group={group}
              pathname={pathname}
              search={search}
            />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center xl:flex">
          <HeaderCta />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:hidden">
          <HeaderCta className="hidden max-w-[11rem] truncate px-3 text-xs sm:inline-flex" />
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
                  const isOpen = openMobileGroup === group.id;
                  const groupActive = isNavGroupActive(group, pathname, search);
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
                      {isOpen ? (
                        <div className="max-h-[min(50vh,20rem)] space-y-0.5 overflow-y-auto overflow-x-hidden border-t border-gray-100 px-2 py-2">
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
