// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const baseEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
};

const billingEnv = {
  BILLING_ENABLED: "true",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  STRIPE_PRICE_BASIC_MONTHLY: "price_basic",
  STRIPE_PRICE_PRO_MONTHLY: "price_pro",
};

const loadEnv = async (values: Record<string, string>) => {
  for (const [key, value] of Object.entries(values)) {
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

  it("disables billing by default and needs no Stripe variables", async () => {
    const env = await loadEnv(baseEnv);
    expect(env.BILLING_ENABLED).toBe(false);
  });

  it("parses a valid billing environment", async () => {
    const env = await loadEnv({ ...baseEnv, ...billingEnv });
    expect(env.BILLING_ENABLED).toBe(true);
    expect(env.STRIPE_PRICE_PRO_MONTHLY).toBe("price_pro");
    expect(env.STRIPE_PRICE_PRO_ANNUAL).toBeUndefined();
  });

  it("requires Stripe variables when billing is enabled", async () => {
    await expect(
      loadEnv({ ...baseEnv, ...billingEnv, STRIPE_SECRET_KEY: "" }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("rejects a short auth secret", async () => {
    await expect(
      loadEnv({ ...baseEnv, BETTER_AUTH_SECRET: "short" }),
    ).rejects.toThrow("Invalid environment variables");
  });

  it("rejects a malformed price id", async () => {
    await expect(
      loadEnv({
        ...baseEnv,
        ...billingEnv,
        STRIPE_PRICE_BASIC_MONTHLY: "prod_123",
      }),
    ).rejects.toThrow("Invalid environment variables");
  });
});
