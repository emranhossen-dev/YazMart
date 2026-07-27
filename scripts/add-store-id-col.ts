import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Adding store_id column to CategoryMatrix if not exists...");
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "public"."CategoryMatrix" ADD COLUMN IF NOT EXISTS "store_id" TEXT;'
  );
  console.log("Column store_id verified/created successfully.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
