"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    (window as any).lenis = lenis;

    return () => {
      lenis.destroy();
    };
  }, []);

  // After every route change, scroll to pending hash (set by navbar before navigation)
  useEffect(() => {
    // Prefer the pre-stored hash (most reliable), fall back to URL hash
    const pending = sessionStorage.getItem('_pendingScrollTo') || window.location.hash;
    if (!pending) return;

    let attempts = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const doScroll = (el: Element) => {
      sessionStorage.removeItem('_pendingScrollTo');
      const lenis = lenisRef.current || (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const tryScroll = () => {
      const el = document.querySelector(pending);
      if (el) {
        // Small extra delay so page layout is stable before scrolling
        setTimeout(() => doScroll(el), 80);
        return;
      }
      // Element not in DOM yet — retry up to 20 times (≈3s total)
      if (++attempts < 20) {
        timerId = setTimeout(tryScroll, 150);
      }
    };

    timerId = setTimeout(tryScroll, 250);
    return () => clearTimeout(timerId);
  }, [pathname]);

  return <>{children}</>;
}
