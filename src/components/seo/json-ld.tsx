export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["HealthClub", "SportsActivityLocation", "LocalBusiness"],
        "@id": "https://zfitspa.ci/#business",
        name: "Z FIT/SPA",
        alternateName: ["ZFIT SPA", "Z FIT SPA Abidjan", "Z Fit Spa Côte d'Ivoire"],
        description:
          "Z FIT/SPA est la salle de sport et spa haut de gamme de référence à Abidjan, Côte d'Ivoire. Nous proposons des cours collectifs (RPM, Aquagym, Zumba, Bodypump, Body Combat, Body Attack, Pilates, TRX, Cross Training), du coaching personnalisé, une piscine et un espace spa.",
        url: "https://zfitspa.ci",
        telephone: "+225",
        email: "contact@zfitspa.ci",
        priceRange: "$$",
        currenciesAccepted: "XOF",
        paymentAccepted: "Cash, Mobile Money, Carte bancaire",
        image: "https://zfitspa.ci/og-image.jpg",
        logo: "https://zfitspa.ci/icon.png",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Abidjan",
          addressLocality: "Abidjan",
          addressRegion: "Abidjan",
          addressCountry: "CI",
          postalCode: "",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 5.3599517,
          longitude: -4.0082563,
        },
        areaServed: [
          { "@type": "City", name: "Abidjan" },
          { "@type": "Country", name: "Côte d'Ivoire" },
        ],
        hasMap: "https://maps.google.com/?q=Z+FIT+SPA+Abidjan",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "06:00",
            closes: "22:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "07:00",
            closes: "20:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Sunday",
            opens: "08:00",
            closes: "14:00",
          },
        ],
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Salle de musculation", value: true },
          { "@type": "LocationFeatureSpecification", name: "Cours collectifs", value: true },
          { "@type": "LocationFeatureSpecification", name: "Aquagym / Piscine", value: true },
          { "@type": "LocationFeatureSpecification", name: "Coaching personnalisé", value: true },
          { "@type": "LocationFeatureSpecification", name: "Espace spa", value: true },
          { "@type": "LocationFeatureSpecification", name: "Vestiaires", value: true },
          { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
          { "@type": "LocationFeatureSpecification", name: "Climatisation", value: true },
        ],
        knowsAbout: [
          "RPM", "Aquagym", "Zumba", "Bodypump", "Body Combat", "Body Attack",
          "Pilates", "TRX", "Cross Training", "Stretching", "Boxing", "Fitness",
          "Musculation", "Bien-être", "Spa",
        ],
        sameAs: [
          "https://www.facebook.com/zfitspa",
          "https://www.instagram.com/zfitspa",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://zfitspa.ci/#website",
        url: "https://zfitspa.ci",
        name: "Z FIT/SPA Abidjan",
        description: "Site officiel de Z FIT/SPA, salle de sport et spa à Abidjan, Côte d'Ivoire",
        inLanguage: "fr-CI",
        publisher: { "@id": "https://zfitspa.ci/#business" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://zfitspa.ci/?s={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
