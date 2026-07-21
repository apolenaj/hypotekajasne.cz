import Link from "next/link";
import { TRUST_NAV } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function TrustNav({ currentPath }: { currentPath?: string }) {
  return (
    <nav
      aria-label="Centrum důvěry"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap gap-2 px-4 py-3 sm:px-6">
        {TRUST_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal",
              currentPath === item.href
                ? "bg-deep-teal text-white"
                : "border border-border text-muted-foreground hover:border-deep-teal/40"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function TrustPageShell({
  eyebrow,
  title,
  lead,
  currentPath,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  currentPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <TrustNav currentPath={currentPath} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {lead}
        </p>
        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </div>
  );
}
