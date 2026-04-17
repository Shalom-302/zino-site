import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
          disallow: ["/admin/", "/td-chef/", "/api/"],
      },
    ],
    sitemap: "https://zfitspa.ci/sitemap.xml",
    host: "https://zfitspa.ci",
  };
}
