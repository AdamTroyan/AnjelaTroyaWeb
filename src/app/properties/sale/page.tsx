import { prisma } from "@/lib/prisma";
import PropertyListClient, { type PropertyCard } from "../PropertyListClient";

export const runtime = "nodejs";

export default async function SalePropertiesPage() {
  const properties = (await prisma.property.findMany({
    where: { type: "SALE", isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrls: true,
      status: true,
      type: true,
      isHot: true,
      details: true,
      address: true,
      latitude: true,
      longitude: true,
    },
  })) as PropertyCard[];

  return (
    <PropertyListClient
      properties={properties}
      heading="דירות למכירה"
      countSuffix="נכסים פעילים"
      emptyLabel="אין נכסים זמינים כרגע."
      alertType="SALE"
    />
  );
}
