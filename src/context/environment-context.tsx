"use client";

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from "react";

// useLayoutEffect on client (runs before paint), useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type Environment = "fitness" | "spa" | null;

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  hasChosen: boolean;
  resolved: boolean; // true once sessionStorage has been read
  resetChoice: () => void;
}

const EnvironmentContext = createContext<EnvironmentContextType>({
  environment: null,
  setEnvironment: () => {},
  hasChosen: false,
  resolved: false,
  resetChoice: () => {},
});

function readEnvFromDOM(): Environment {
  if (typeof document === "undefined") return null;
  const attr = document.documentElement.getAttribute("data-env") as Environment;
  return attr === "fitness" || attr === "spa" ? attr : null;
}

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads data-env (only set by blocking script when a real choice exists)
  const [environment, setEnvironmentState] = useState<Environment>(readEnvFromDOM);
  const [hasChosen, setHasChosen] = useState<boolean>(() => readEnvFromDOM() !== null);
  // resolved = true immediately on client only when a choice was already made (data-env exists)
  // otherwise wait for useLayoutEffect below (new visitors)
  const [resolved, setResolved] = useState<boolean>(() => typeof document !== "undefined" && readEnvFromDOM() !== null);

  // Keep in sync and handle SSR hydration (server rendered null, client may differ)
  useIsomorphicLayoutEffect(() => {
    const saved = sessionStorage.getItem("zfitspa_env") as Environment;
    if (saved === "fitness" || saved === "spa") {
      setEnvironmentState(saved);
      setHasChosen(true);
    }
    setResolved(true);
  }, []);

  const setEnvironment = (env: Environment) => {
    setEnvironmentState(env);
    setHasChosen(true);
    if (env) {
      sessionStorage.setItem("zfitspa_env", env);
      document.documentElement.setAttribute("data-env", env);
    }
  };

  const resetChoice = () => {
    sessionStorage.removeItem("zfitspa_env");
    document.documentElement.removeAttribute("data-env");
    setEnvironmentState(null);
    setHasChosen(false);
    setResolved(true);
  };

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment, hasChosen, resolved, resetChoice }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  return useContext(EnvironmentContext);
}
