// Promotes an existing user to admin. Better Auth's role endpoints require an
// admin session, so the first admin has to be created directly in the database.
// Usage: pnpm admin:grant <email>
import { config } from "dotenv";
import { Client } from "pg";

config({ path: [".env", ".env.example"], quiet: true });

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: pnpm admin:grant <email>");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rowCount } = await client.query(
    `UPDATE "user" SET role = 'admin', "updatedAt" = now() WHERE email = $1`,
    [email],
  );
  if (!rowCount) {
    console.error(`No user with email ${email}. Sign up first.`);
    process.exitCode = 1;
  } else {
    console.log(`${email} is now an admin.`);
  }
} finally {
  await client.end();
}
