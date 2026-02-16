import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const RETAIN_INQUIRIES_DAYS = 365;
const REDACT_TESTIMONIAL_IP_DAYS = 30;
const REDACT_ALERT_IP_DAYS = 180;

const now = Date.now();
const inquiriesCutoff = new Date(now - RETAIN_INQUIRIES_DAYS * DAY_MS);
const testimonialCutoff = new Date(now - REDACT_TESTIMONIAL_IP_DAYS * DAY_MS);
const alertCutoff = new Date(now - REDACT_ALERT_IP_DAYS * DAY_MS);

try {
  const [propertyInquiries, contactInquiries, testimonialRedact, alertRedact] = await Promise.all([
    prisma.propertyInquiry.deleteMany({
      where: { createdAt: { lt: inquiriesCutoff } },
    }),
    prisma.contactInquiry.deleteMany({
      where: { createdAt: { lt: inquiriesCutoff } },
    }),
    prisma.testimonial.updateMany({
      where: { createdAt: { lt: testimonialCutoff }, ip: { not: null } },
      data: { ip: null },
    }),
    prisma.propertyAlert.updateMany({
      where: { createdAt: { lt: alertCutoff } },
      data: { consentIp: null, consentUserAgent: null },
    }),
  ]);

  console.log(
    `Deleted inquiries: property=${propertyInquiries.count}, contact=${contactInquiries.count}.`
  );
  console.log(`Redacted testimonial IPs: ${testimonialRedact.count}.`);
  console.log(`Redacted alert consent metadata: ${alertRedact.count}.`);
} catch (error) {
  console.error("PII cleanup failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
