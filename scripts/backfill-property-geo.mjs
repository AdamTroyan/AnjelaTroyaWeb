import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
const USER_AGENT = `AnjelaTroyRealEstate/1.0 (${SITE_URL || "local"})`;
const DELAY_MS = 1100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeAddress(address) {
  const query = address.trim();
  if (!query) {
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "he",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const first = data[0];
  if (!first) {
    return null;
  }

  const latitude = Number.parseFloat(first.lat);
  const longitude = Number.parseFloat(first.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

async function run() {
  const properties = await prisma.property.findMany({
    where: {
      address: { not: null },
      OR: [{ latitude: null }, { longitude: null }],
    },
    select: { id: true, address: true },
  });

  console.log(`Found ${properties.length} properties missing coordinates.`);

  for (const property of properties) {
    const address = property.address || "";
    const geo = await geocodeAddress(address);
    if (geo) {
      await prisma.property.update({
        where: { id: property.id },
        data: {
          latitude: geo.latitude,
          longitude: geo.longitude,
        },
      });
      console.log(`Updated ${property.id} -> ${geo.latitude}, ${geo.longitude}`);
    } else {
      console.warn(`Failed to geocode ${property.id}: ${address}`);
    }
    await sleep(DELAY_MS);
  }

  await prisma.$disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
