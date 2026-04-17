import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs & Abonnements – Salle de Sport Abidjan",
  description:
    "Découvrez les tarifs et abonnements de Z FIT/SPA à Abidjan. Formules flexibles pour accéder à notre salle de sport, cours collectifs, aquagym et spa en Côte d'Ivoire. Abonnement mensuel, trimestriel ou annuel.",
  keywords: [
    "tarifs salle de sport Abidjan",
    "abonnement gym Abidjan",
    "prix fitness Abidjan",
    "abonnement spa Abidjan",
    "tarif musculation Abidjan",
    "cours collectifs prix Abidjan",
    "abonnement mensuel sport Côte d'Ivoire",
    "Z FIT SPA tarif",
  ],
  openGraph: {
    title: "Tarifs & Abonnements – Z FIT/SPA Abidjan",
    description:
      "Formules d'abonnement flexibles à Abidjan. Accédez à la salle de sport, cours collectifs, aquagym et spa de Z FIT/SPA.",
    url: "https://zfitspa.ci/tarifs",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://zfitspa.ci/tarifs",
  },
};

export { default } from "./page";
