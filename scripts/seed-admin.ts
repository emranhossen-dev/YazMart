import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { seedAdminUser } = await import("../src/lib/seed-admin-user");
  const { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } = await import(
    "../src/lib/admin-credentials"
  );

  const result = await seedAdminUser();
  console.log("Admin user seeded successfully.");
  console.log(`Email: ${result.email}`);
  console.log(`Password: ${result.password}`);
  console.log(`User ID: ${result.userId}`);
}

main().catch(async (error) => {
  const { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } = await import(
    "../src/lib/admin-credentials"
  );
  console.error("Failed to seed admin user:", error);
  console.error(
    `Expected credentials: ${DEV_ADMIN_EMAIL} / ${DEV_ADMIN_PASSWORD}`
  );
  process.exit(1);
});
