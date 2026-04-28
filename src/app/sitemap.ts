import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zfitspa.ci";
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/tarifs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/programme`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
      {
        url: `${baseUrl}/reservation`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/carte-soins`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/carte-cadeau`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];
  }
