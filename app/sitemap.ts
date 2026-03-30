import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SECTOR_SLUGS = [
  "bouw",
  "transport",
  "horeca",
  "detailhandel",
  "zorg",
  "beveiliging",
  "kinderopvang",
  "schoonmaak",
  "kantoor",
  "onderwijs",
  "landbouw",
  "industrie",
  "automotive",
  "installatietechniek",
  "kappers-beauty",
  "vastgoed",
  "financieel",
  "recreatie",
  "overheid",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries = posts.map((post) => ({
    url: `https://snelrie.nl/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const sectorEntries = SECTOR_SLUGS.map((slug) => ({
    url: `https://snelrie.nl/sector/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://snelrie.nl",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://snelrie.nl/scan",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://snelrie.nl/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...sectorEntries,
    ...blogEntries,
    {
      url: "https://snelrie.nl/voorwaarden",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
