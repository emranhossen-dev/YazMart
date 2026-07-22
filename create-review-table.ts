import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log('Creating ProductReview table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."ProductReview" (
        "id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "user_id" UUID NOT NULL,
        "user_name" TEXT NOT NULL,
        "user_email" TEXT,
        "order_id" TEXT,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('Table created (or already exists).');
    const count = await prisma.productReview.count();
    console.log('ProductReview table ready. Current row count:', count);
  } catch (err: any) {
    console.error('ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
