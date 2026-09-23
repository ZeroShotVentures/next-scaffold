import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: [".env", ".env.example"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
