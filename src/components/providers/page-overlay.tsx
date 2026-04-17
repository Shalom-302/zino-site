"use client";

import { motion } from "framer-motion";
import { usePageTransition } from "@/context/transition-context";
import { useEnvironment } from "@/context/environment-context";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const FITNESS_BG = "#0a0a0a";
const SPA_BG = "#F4EBD9";

export default function PageOverlay() {
  const { phase } = usePageTransition();
  const { environment } = useEnvironment();

  const isSpa = environment === "spa";
  const bgColor = isSpa ? SPA_BG : FITNESS_BG;
  const accentColor = isSpa ? "rgba(196,168,122,0.7)" : "rgba(225,48,39,0.6)";

  // Vertical wipe: slides up from bottom, then exits upward
  const y =
    phase === "idle"
      ? "100%"
      : phase === "covering"
      ? "0%"
      : "-100%";

  const duration =
    phase === "covering" ? 0.42 : phase === "revealing" ? 0.55 : 0;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        backgroundColor: bgColor,
        pointerEvents: phase !== "idle" ? "all" : "none",
      }}
      animate={{ y }}
      transition={{ duration, ease: EASE }}
    >
      {phase === "covering" && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1.5px",
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}
