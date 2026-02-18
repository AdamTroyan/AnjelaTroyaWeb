import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl() || "https://anjelatroya.co.il";

  const properties = await prisma.property.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/properties/sale`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/properties/rent`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/valuation`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/testimonials`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/accessibility`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const propertyPages: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${baseUrl}/properties/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
