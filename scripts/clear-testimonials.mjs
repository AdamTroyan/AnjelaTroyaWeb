import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const result = await prisma.testimonial.deleteMany();
  console.log(`Deleted ${result.count} testimonials.`);
} catch (error) {
  console.error("Failed to clear testimonials", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
