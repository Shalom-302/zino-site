import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programme & Emploi du Temps – Cours Collectifs Abidjan",
  description:
    "Consultez le programme mensuel de Z FIT/SPA à Abidjan. Emploi du temps des cours collectifs : RPM, Aquagym, Les Mills, HBX, Zumba, Bodypump, Body Combat et plus encore. Côte d'Ivoire.",
  keywords: [
    "programme cours collectifs Abidjan",
    "emploi du temps salle sport Abidjan",
    "planning cours fitness Abidjan",
    "horaires RPM Abidjan",
    "horaires Aquagym Abidjan",
    "horaires Zumba Abidjan",
    "cours Bodypump Abidjan",
    "Body Combat Abidjan horaires",
    "programme sport Côte d'Ivoire",
    "Z FIT SPA programme",
  ],
  openGraph: {
    title: "Programme des Cours – Z FIT/SPA Abidjan",
    description:
      "Planning mensuel des cours collectifs à Z FIT/SPA Abidjan : RPM, Aquagym, Zumba, Bodypump, Body Combat et plus. Côte d'Ivoire.",
    url: "https://zfitspa.ci/programme",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://zfitspa.ci/programme",
  },
};

export { default } from "./page";
