// Vercel runs the `vercel-build` package script instead of `build`.
// Migrations are applied only on production deploys, so preview deploys
// (which share the production DATABASE_URL unless overridden) never change
// the schema of a database that production is reading.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function shouldMigrate(
  env: Record<string, string | undefined>,
): boolean {
  return env["VERCEL_ENV"] === "production";
}

function run(command: string, args: string[]): void {
  const { status } = spawnSync(command, args, { stdio: "inherit" });
  if (status !== 0) {
    process.exit(status ?? 1);
  }
}

function main(): void {
  if (shouldMigrate(process.env)) {
    console.log("Production deploy: applying database migrations.");
    run("prisma", ["migrate", "deploy"]);
  } else {
    console.log(
      `Skipping database migrations (VERCEL_ENV=${process.env["VERCEL_ENV"] ?? "unset"}).`,
    );
  }
  run("next", ["build"]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
