"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

const PREFETCH_ROUTES = [
  "/",
  "/carte-soins",
  "/programme",
  "/tarifs",
  "/reservation",
  "/carte-cadeau",
  "/faq",
];

export type TransitionPhase = "idle" | "covering" | "revealing";

type TransitionContextType = {
  navigateTo: (href: string) => void;
  onPageMounted: () => void;
  phase: TransitionPhase;
};

const TransitionContext = createContext<TransitionContextType>({
  navigateTo: () => {},
  onPageMounted: () => {},
  phase: "idle",
});

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");

  const prevPathname = useRef(pathname);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefetch all routes on mount for instant navigation
  useEffect(() => {
    PREFETCH_ROUTES.forEach((route) => router.prefetch(route));
  }, [router]);

  // When pathname changes while covering → start reveal phase
  useEffect(() => {
    if (pathname !== prevPathname.current && phase === "covering") {
      prevPathname.current = pathname;

      // Small delay so new page has time to render before revealing
      revealTimer.current = setTimeout(() => {
        setPhase("revealing");
        // After reveal animation completes, reset to idle
        idleTimer.current = setTimeout(() => {
          setPhase("idle");
        }, 620); // slightly longer than reveal animation duration (0.55s)
      }, 80);
    } else {
      prevPathname.current = pathname;
    }
  }, [pathname, phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const triggerReveal = useCallback((delay = 80) => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    revealTimer.current = setTimeout(() => {
      setPhase("revealing");
      idleTimer.current = setTimeout(() => {
        setPhase("idle");
      }, 620);
    }, delay);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      // Prevent double-trigger during transition
      if (phase !== "idle") {
        router.push(href);
        return;
      }

      // Strip hash/query to compare just the path
      const targetPath = href.split("#")[0].split("?")[0] || "/";
      const isSamePath = targetPath === pathname;

      setPhase("covering");
      setTimeout(() => {
        router.push(href);
        // If target path === current path, pathname won't change →
        // the reveal useEffect won't fire → manually trigger reveal.
        // Use a longer delay for same-path (env switch) so new content
        // has time to fetch + images have time to load from cache.
        if (isSamePath) {
          triggerReveal(420);
        }
      }, 380);
    },
    [router, phase, pathname, triggerReveal]
  );

  const onPageMounted = useCallback(() => {}, []);

  return (
    <TransitionContext.Provider value={{ navigateTo, onPageMounted, phase }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(TransitionContext);
}
