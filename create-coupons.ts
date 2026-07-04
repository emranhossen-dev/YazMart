import { prisma } from './src/lib/prisma';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(255) UNIQUE NOT NULL,
        discount_type VARCHAR(50) NOT NULL DEFAULT 'percentage',
        discount_value DOUBLE PRECISION NOT NULL,
        min_order_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        valid_until TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Coupons table created successfully.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

main();
