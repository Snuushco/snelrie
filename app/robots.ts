import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/chat/"],
      },
    ],
    sitemap: "https://snelrie.nl/sitemap.xml",
  };
}
