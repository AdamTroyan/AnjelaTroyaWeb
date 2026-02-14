import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars.");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
const passwordHash = `scrypt$${salt}$${hash}`;

await prisma.user.upsert({
  where: { email },
  update: {
    passwordHash,
    role: "ADMIN",
    isActive: true,
  },
  create: {
    email,
    passwordHash,
    role: "ADMIN",
    isActive: true,
  },
});

await prisma.$disconnect();

console.log("Admin user created/updated.");
