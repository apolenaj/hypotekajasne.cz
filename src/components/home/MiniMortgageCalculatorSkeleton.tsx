/**
 * Placeholder kalkulačky — stabilní výška pro CLS, bez JS na kritické cestě.
 */
export function MiniMortgageCalculatorSkeleton() {
  return (
    <article
      aria-hidden
      className="box-border w-full min-w-0 max-w-full min-h-[28rem] rounded-2xl border border-white/20 bg-white p-4 shadow-lg sm:min-h-[30rem] sm:p-6 md:max-w-md"
    >
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200 motion-reduce:animate-none" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none" />
        <div className="h-16 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none" />
        <div className="h-16 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none sm:col-span-2" />
      </div>
      <div className="mt-6 h-11 animate-pulse rounded-lg bg-deep-teal/20 motion-reduce:animate-none" />
      <p className="sr-only">Načítám kalkulačku…</p>
    </article>
  );
}
