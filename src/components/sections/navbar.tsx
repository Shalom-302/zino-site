"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useEnvironment } from "@/context/environment-context";
import { usePageTransition } from "@/context/transition-context";
import { supabase } from "@/lib/supabase";

const DEFAULT_FITNESS_LINKS = [
  { name: "Cours", href: "/#nos-cours" },
  { name: "Planning", href: "/programme" },
  { name: "Coachs", href: "/#nos-coachs" },
  { name: "Tarifs", href: "/tarifs" },
  { name: "FAQ", href: "/faq" },
];

const DEFAULT_SPA_LINKS = [
  { name: "Carte des soins", href: "/carte-soins" },
  { name: "Nos maisons", href: "/#nos-maisons" },
  { name: "Carte cadeau", href: "/carte-cadeau" },
  { name: "FAQ", href: "/faq" },
];

const NavbarInner = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState(DEFAULT_FITNESS_LINKS);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const isHome = pathname === '/';
  const { navigateTo } = usePageTransition();

  // Handle anchor links like /#nos-coachs — store hash BEFORE navigation so SmoothScroll can reliably find it
  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith('/#')) {
      // Regular page link — use transition
      e.preventDefault();
      setIsMobileMenuOpen(false);
      navigateTo(href);
      return;
    }
    e.preventDefault();
    const hash = href.slice(1); // e.g. "#nos-coachs"
    if (pathname === '/') {
      // Already on homepage — scroll directly with retry if element not yet in DOM
      const tryScroll = (attempts = 0) => {
        const lenis = (window as any).lenis;
        const el = document.querySelector(hash);
        if (el) {
          if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
          else el.scrollIntoView({ behavior: 'smooth' });
        } else if (attempts < 15) {
          setTimeout(() => tryScroll(attempts + 1), 150);
        }
      };
      tryScroll();
    } else {
      // Store hash in sessionStorage so SmoothScroll finds it reliably on arrival
      sessionStorage.setItem('_pendingScrollTo', hash);
      navigateTo('/');
    }
    setIsMobileMenuOpen(false);
  };
  const { environment, hasChosen, setEnvironment, resetChoice } = useEnvironment();

  const ctaLabel = environment === "spa" ? "Prendre rendez-vous" : "Découvrir le club";
  // Spa hero has a light background — use dark text until user scrolls
  const navTextColor = environment === "spa" ? "#1C1108" : "#fff";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!environment) return;

    const fetchNavLinks = async () => {
      const { data: snapData } = await supabase
        .from("environment_content")
        .select("*")
        .eq("environment", environment)
        .eq("section", "navbar");

      const defaults = environment === "spa" ? DEFAULT_SPA_LINKS : DEFAULT_FITNESS_LINKS;
      const snap = snapData || [];
      if (snap.length > 0) {
        const map: Record<string, string> = {};
        snap.forEach((d) => { map[d.key] = d.value; });
        // For fitness: use Supabase only if it has the 5-link structure
        // For spa: always use defaults (4 links)
        if (environment === "fitness" && (map["link4_label"] || map["link4_href"] || map["link5_label"] || map["link5_href"])) {
          setNavLinks([
            { name: map["link1_label"] || defaults[0].name, href: map["link1_href"] || defaults[0].href },
            { name: map["link2_label"] || defaults[1].name, href: map["link2_href"] || defaults[1].href },
            { name: map["link3_label"] || defaults[2].name, href: map["link3_href"] || defaults[2].href },
            { name: map["link4_label"] || defaults[3].name, href: map["link4_href"] || defaults[3].href },
            { name: map["link5_label"] || defaults[4].name, href: map["link5_href"] || defaults[4].href },
          ]);
        } else {
          setNavLinks(defaults);
        }
      } else {
        setNavLinks(defaults);
      }
    };

    fetchNavLinks();
  }, [environment]);

  // Cacher la navbar sur la page d'accueil tant que l'utilisateur n'a pas choisi
  if (pathname === "/" && !hasChosen) return null;

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[1001] transition-all duration-500 ${
        scrolled
          ? environment === "spa"
            ? "bg-white/80 backdrop-blur-2xl shadow-[0_4px_32px_rgba(28,17,8,0.1)]"
            : "bg-black/40 backdrop-blur-2xl shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}>
        {scrolled && (
          <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${environment === "spa" ? "via-[#C4A87A]/40" : "via-white/30"} to-transparent pointer-events-none`} />
        )}
        <nav className="h-[80px] md:h-[120px]">
          <div className="w-full px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigateTo('/')}
                  className="block cursor-pointer"
                  aria-label="Retour à l'accueil"
                >
                  <Image
                    src={environment === "spa" ? "/logo-spa.webp" : "/logo.png"}
                    alt="ZFitSpa Logo"
                    width={434}
                    height={154}
                    className="h-[88px] sm:h-[108px] md:h-[127px] w-auto object-contain"
                    priority
                    unoptimized
                  />
                </button>
              </div>

              {/* Desktop Menu Links */}
              <div className="hidden lg:flex items-center flex-1 justify-end ml-10">
                <LayoutGroup id="navbar">
                  <ul className="flex items-center gap-10 mr-12">
                    {navLinks.map((item, idx) => {
                      const active = item.href.startsWith('/#') ? false : pathname === item.href;
                      const showUnderline = !isHome && (
                        hoveredItem === item.name || (hoveredItem === null && active)
                      );
                      return (
                        <motion.li
                          key={item.name}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                        >
                          <a
                            href={item.href}
                            onClick={(e) => handleAnchorClick(e, item.href)}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className="relative inline-block text-[13px] font-semibold tracking-tight hover:text-[#E13027] transition-colors pb-1"
                            style={{ color: navTextColor }}
                          >
                            {item.name}
                            {showUnderline && (
                              <motion.span
                                layoutId="nav-underline"
                                className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                                style={{ backgroundColor: '#E13027' }}
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                          </a>
                        </motion.li>
                      );
                    })}
                  </ul>
                </LayoutGroup>
              </div>

            <div className="flex items-center gap-3 md:gap-4">
              {/* Bouton switch environnement */}
              {hasChosen && (
                <button
                  onClick={() => {
                    setEnvironment(environment === "spa" ? "fitness" : "spa");
                    navigateTo('/');
                  }}
                  className="hidden lg:block text-[13px] font-semibold tracking-tight hover:text-[#E13027] transition-colors"
                  style={{ color: navTextColor }}
                >
                  {environment === "spa" ? "LE FITNESS" : "LE SPA"}
                </button>
              )}

              <button
                onClick={() => navigateTo('/reservation')}
                className="btn-primary inline-flex items-center justify-center text-[13px] px-5 sm:px-6 md:px-8 h-[38px] sm:h-[42px] md:h-[46px] lg:h-[50px] whitespace-nowrap"
                style={{
                  color: navTextColor,
                  borderColor: environment === "spa" ? 'rgba(28,17,8,0.2)' : 'rgba(255,255,255,0.2)',
                }}
              >
                  {ctaLabel}
                </button>

                <motion.button
                className="lg:hidden btn-primary h-[38px] sm:h-[42px] md:h-[45px] aspect-square flex items-center justify-center p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  color: navTextColor,
                  borderColor: environment === "spa" ? 'rgba(28,17,8,0.2)' : 'rgba(255,255,255,0.2)',
                }}
              >
                {isMobileMenuOpen
                  ? <X className="w-[26px] h-[26px] sm:w-[31px] sm:h-[31px] md:w-[42px] md:h-[42px] stroke-[3px]" />
                  : <Plus className="w-[26px] h-[26px] sm:w-[31px] sm:h-[31px] md:w-[42px] md:h-[42px] stroke-[3px]" />
                }
              </motion.button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu — outside header to avoid z-index stacking context issues */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            style={{ backgroundColor: environment === "spa" ? "#F4EBD9" : "#000000" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-6 flex flex-col h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8 landscape:mb-4 flex-shrink-0">
                <Image
                  src={environment === "spa" ? "/logo-spa.webp" : "/logo.png"}
                  alt="ZFitSpa Logo"
                  width={350}
                  height={118}
                  className="h-[72px] landscape:h-[48px] w-auto object-contain"
                  unoptimized
                />
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <X className="w-8 h-8 text-[#E13027]" />
                </motion.button>
              </div>

               <ul className="flex flex-col gap-5 landscape:gap-3 mb-8 landscape:mb-4">
                  {navLinks.map((item, idx) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleAnchorClick(e, item.href)}
                      className="text-[24px] landscape:text-[18px] font-black uppercase tracking-tighter"
                      style={{ color: environment === "spa" ? "#1C1108" : "#ffffff" }}
                    >
                      {item.name}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3 flex-shrink-0">
                {hasChosen && (
                  <button
                    onClick={() => {
                    setEnvironment(environment === "spa" ? "fitness" : "spa");
                    setIsMobileMenuOpen(false);
                    navigateTo('/');
                  }}
                    className="text-[24px] landscape:text-[18px] font-black uppercase tracking-tighter hover:text-[#E13027] transition-colors text-left"
                    style={{ color: environment === "spa" ? "#1C1108" : "#ffffff" }}
                  >
                    {environment === "spa" ? "LE FITNESS" : "LE SPA"}
                  </button>
                )}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigateTo('/reservation'); }}
                  className="btn-primary flex items-center justify-center w-full py-3 landscape:py-2 text-[18px]"
                >
                    {ctaLabel}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  if (pathname.startsWith('/td-chef')) return null;
  return <NavbarInner />;
};

export default Navbar;
