import { describe, expect, it } from "vitest";
import { shouldMigrate } from "./vercel-build.mjs";

describe("shouldMigrate", () => {
  it("migrates on production deploys", () => {
    expect(shouldMigrate({ VERCEL_ENV: "production" })).toBe(true);
  });

  it.each(["preview", "development", "staging"])(
    "skips VERCEL_ENV=%s",
    (value) => {
      expect(shouldMigrate({ VERCEL_ENV: value })).toBe(false);
    },
  );

  it("skips when VERCEL_ENV is unset", () => {
    expect(shouldMigrate({})).toBe(false);
  });
});
