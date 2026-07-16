const fs = require('fs');
const { Client } = require('pg');

async function run() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    try {
      const envText = fs.readFileSync(".env.local", "utf8");
      const match = envText.match(/DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/);
      if (match) {
        connectionString = match[1];
      }
    } catch (_) {}
  }

  if (!connectionString) {
    console.error("DATABASE_URL not found.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes("supabase.com") ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();

    // Query profiles
    const profiles = await client.query(`
      SELECT p.id, p.full_name, r.name as role_name 
      FROM public.profiles p
      LEFT JOIN public.roles r ON p.role_id = r.id;
    `);
    console.log("PROFILES IN SYSTEM:");
    profiles.rows.forEach(p => {
      console.log(`- User ID: ${p.id} | Name: ${p.full_name} | Role: ${p.role_name}`);
    });

    // Query stores
    const stores = await client.query(`
      SELECT id, name, owner_id, slug, status 
      FROM public."Store";
    `);
    console.log("\nSTORES IN SYSTEM:");
    stores.rows.forEach(s => {
      console.log(`- Store ID: ${s.id} | Name: ${s.name} | Owner: ${s.owner_id} | Slug: ${s.slug} | Status: ${s.status}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
