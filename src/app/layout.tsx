import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import StyledJsxRegistry from "./registry";
import SmoothScroll from "@/components/providers/smooth-scroll";
import PageTransition from "@/components/providers/page-transition";
import PageOverlay from "@/components/providers/page-overlay";
import JsonLd from "@/components/seo/json-ld";
import { Toaster } from "sonner";
import { EnvironmentProvider } from "@/context/environment-context";
import { TransitionProvider } from "@/context/transition-context";
import Navbar from "@/components/sections/navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://zfitspa.ci"),
  title: {
    default: "Z FIT/SPA – Salle de Sport & Spa Abidjan | Côte d'Ivoire",
    template: "%s | Z FIT/SPA Abidjan",
  },
  description:
    "Z FIT/SPA, la salle de sport et spa haut de gamme à Abidjan, Côte d'Ivoire. Cours collectifs (RPM, Aquagym, Zumba, Bodypump…), coaching personnalisé, piscine et espace bien-être. Rejoignez la communauté fitness #1 à Abidjan.",
  keywords: [
    "salle de sport Abidjan",
    "gym Abidjan",
    "fitness Abidjan",
    "spa Abidjan",
    "salle de musculation Abidjan",
    "cours collectifs Abidjan",
    "RPM Abidjan",
    "Aquagym Abidjan",
    "Zumba Abidjan",
    "Bodypump Abidjan",
    "coaching sportif Abidjan",
    "Z FIT SPA",
    "ZFIT SPA",
    "sport Côte d'Ivoire",
    "salle de sport Côte d'Ivoire",
    "fitness Côte d'Ivoire",
    "bien-être Abidjan",
    "piscine Abidjan",
    "musculation Abidjan",
    "Les Mills Abidjan",
    "HBX Abidjan",
    "Body Combat Abidjan",
    "Body Attack Abidjan",
    "Pilates Abidjan",
    "TRX Abidjan",
    "Cross Training Abidjan",
    "sport Cocody",
    "sport Plateau Abidjan",
    "abonnement salle sport Abidjan",
  ],
  authors: [{ name: "Z FIT/SPA Abidjan" }],
  creator: "Z FIT/SPA",
  publisher: "Z FIT/SPA",
  category: "Sports & Fitness",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://zfitspa.ci",
    siteName: "Z FIT/SPA Abidjan",
    title: "Z FIT/SPA – Salle de Sport & Spa #1 à Abidjan, Côte d'Ivoire",
    description:
      "Salle de sport et spa haut de gamme à Abidjan. Cours collectifs, coaching personnalisé, piscine. Rejoignez Z FIT/SPA dès aujourd'hui.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Z FIT/SPA – Salle de sport et spa à Abidjan, Côte d'Ivoire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Z FIT/SPA – Salle de Sport & Spa à Abidjan",
    description:
      "Cours collectifs, coaching personnalisé, spa et piscine à Abidjan. Découvrez Z FIT/SPA, le complexe fitness de référence en Côte d'Ivoire.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://zfitspa.ci",
  },
  verification: {
    google: "google-site-verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fr">
      <head>
        <link rel="canonical" href="https://zfitspa.ci" />
        <meta name="geo.region" content="CI-AB" />
        <meta name="geo.placename" content="Abidjan, Côte d'Ivoire" />
        <meta name="geo.position" content="5.3599517;-4.0082563" />
        <meta name="ICBM" content="5.3599517, -4.0082563" />
        <meta name="language" content="French" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        {/* Blocking script: hide body until env is read from sessionStorage, preventing any flash */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var e = sessionStorage.getItem('zfitspa_env');
    if (e === 'fitness' || e === 'spa') {
      document.documentElement.setAttribute('data-env', e);
    }
  } catch(err) {}
})();
        `}} />
      </head>
      <body className="antialiased">
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SB50J2J3RV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SB50J2J3RV');
          `}
        </Script>
        <JsonLd />
          <StyledJsxRegistry>
            <TransitionProvider>
              <EnvironmentProvider>
                <PageOverlay />
                <Navbar />
                <SmoothScroll>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </SmoothScroll>
              </EnvironmentProvider>
            </TransitionProvider>
              <Toaster position="top-right" richColors />
            </StyledJsxRegistry>
          <VisualEditsMessenger />
        </body>
    </html>
  );
}
