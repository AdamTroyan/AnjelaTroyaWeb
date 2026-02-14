import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.USER_EMAIL;
const password = process.env.USER_PASSWORD;

if (!email || !password) {
  console.error("Missing USER_EMAIL or USER_PASSWORD env vars.");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
const passwordHash = `scrypt$${salt}$${hash}`;

await prisma.user.upsert({
  where: { email },
  update: {
    passwordHash,
    role: "USER",
    isActive: true,
  },
  create: {
    email,
    passwordHash,
    role: "USER",
    isActive: true,
  },
});

await prisma.$disconnect();

console.log("User account created/updated.");
