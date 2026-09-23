// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  STRIPE_PRICE_BASIC_MONTHLY: "price_basic",
  STRIPE_PRICE_PRO_MONTHLY: "price_pro",
};

const loadEnv = async (overrides: Record<string, string> = {}) => {
  for (const [key, value] of Object.entries({ ...validEnv, ...overrides })) {
    vi.stubEnv(key, value);
  }
  const { env } = await import("./env");
  return env;
};

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("parses a valid environment", async () => {
    const env = await loadEnv();
    expect(env.STRIPE_PRICE_PRO_MONTHLY).toBe("price_pro");
    expect(env.STRIPE_PRICE_PRO_ANNUAL).toBeUndefined();
  });

  it("treats empty strings as missing", async () => {
    await expect(loadEnv({ STRIPE_SECRET_KEY: "" })).rejects.toThrow(
      "Invalid environment variables",
    );
  });

  it("rejects a short auth secret", async () => {
    await expect(loadEnv({ BETTER_AUTH_SECRET: "short" })).rejects.toThrow(
      "Invalid environment variables",
    );
  });

  it("rejects a malformed price id", async () => {
    await expect(
      loadEnv({ STRIPE_PRICE_BASIC_MONTHLY: "prod_123" }),
    ).rejects.toThrow("Invalid environment variables");
  });
});
