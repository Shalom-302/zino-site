"use client";

import { motion } from "framer-motion";
import { usePageTransition } from "@/context/transition-context";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const { onPageMounted } = usePageTransition();

  useEffect(() => {
    onPageMounted();
    const hasPendingAnchor = sessionStorage.getItem('_pendingScrollTo') || window.location.hash;
    if (!hasPendingAnchor) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
