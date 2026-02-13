import { animate } from "animejs";
import { useCallback, useEffect, useRef } from "react";

type AnimeParams = Parameters<typeof animate>[1];

const prefersReduced =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export function useAnime() {
  const targets = useRef<(HTMLElement | null)[]>([]);

  const ref = useCallback((index: number) => (el: HTMLElement | null) => {
    targets.current[index] = el;
  }, []);

  const run = useCallback(
    (targetIndex: number | undefined, params: AnimeParams) => {
      if (prefersReduced) return;
      const t =
        targetIndex !== undefined
          ? targets.current[targetIndex]
          : targets.current.filter(Boolean);
      if (!t || (Array.isArray(t) && t.length === 0)) return;
      animate(t, params);
    },
    [],
  );

  return { ref, animate: run, targets } as const;
}

export function useAnimeOnMount(params: AnimeParams) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced || !containerRef.current) return;
    const children = containerRef.current.children;
    if (children.length === 0) return;
    animate(children, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return containerRef;
}
