"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DeferClientMountProps = {
  children: ReactNode;
  /** Static placeholder — same dimensions to limit CLS. */
  placeholder?: ReactNode;
  rootMargin?: string;
  /** Called once when the mount threshold is reached (e.g. dynamic import). */
  onMount?: () => void;
};

/**
 * Mounts children only when near viewport — defers hydration cost below the fold.
 * Placeholder stays in DOM for SEO/crawl (pass server-rendered preview if needed).
 */
export function DeferClientMount({
  children,
  placeholder = null,
  rootMargin = "200px 0px",
  onMount,
}: DeferClientMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const onMountRef = useRef(onMount);
  onMountRef.current = onMount;

  useEffect(() => {
    const node = ref.current;
    if (!node || mounted) return;

    const activate = () => {
      setMounted(true);
      onMountRef.current?.();
    };

    if (!("IntersectionObserver" in window)) {
      activate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          activate();
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} className="min-w-0">
      {mounted ? children : placeholder}
    </div>
  );
}
