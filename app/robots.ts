import type { MetadataRoute } from "next";

const SITE_URL = "https://dalgoridim.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/project/"],
        disallow: ["/admin", "/api/", "/notes"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
