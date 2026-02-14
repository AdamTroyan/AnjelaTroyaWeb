import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "0123456789";
const LETTER_POSITIONS = [4, 6, 11, 13];
const TOTAL_LENGTH = 14;

function randomChar(chars) {
  const index = Math.floor(Math.random() * chars.length);
  return chars[index] ?? "";
}

function generatePropertyId() {
  const letters = new Set();
  while (letters.size < LETTER_POSITIONS.length) {
    letters.add(randomChar(LETTERS));
  }
  const lettersArray = Array.from(letters);

  const chars = Array.from({ length: TOTAL_LENGTH }, () => "");
  LETTER_POSITIONS.forEach((pos, index) => {
    chars[pos] = lettersArray[index] ?? randomChar(LETTERS);
  });

  for (let i = 0; i < TOTAL_LENGTH; i += 1) {
    if (!chars[i]) {
      chars[i] = randomChar(DIGITS);
    }
  }

  return chars.join("");
}

async function run() {
  const properties = await prisma.property.findMany({
    select: { id: true },
  });

  const existingIds = new Set(properties.map((item) => item.id));
  const mapping = new Map();

  for (const property of properties) {
    let nextId = generatePropertyId();
    while (existingIds.has(nextId)) {
      nextId = generatePropertyId();
    }
    existingIds.add(nextId);
    mapping.set(property.id, nextId);
  }

  for (const [oldId, newId] of mapping.entries()) {
    await prisma.property.update({
      where: { id: oldId },
      data: { id: newId },
    });
  }

  await prisma.$disconnect();

  console.log(`Updated ${mapping.size} property IDs.`);
  console.log("Important: old links and saved favorites will no longer work.");
}

run().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
