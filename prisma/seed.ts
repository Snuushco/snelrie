import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  // No seed data needed for MVP — users and reports are created on the fly
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
