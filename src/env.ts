import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const priceId = z.string().startsWith("price_");

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    STRIPE_PRICE_BASIC_MONTHLY: priceId,
    STRIPE_PRICE_BASIC_ANNUAL: priceId.optional(),
    STRIPE_PRICE_PRO_MONTHLY: priceId,
    STRIPE_PRICE_PRO_ANNUAL: priceId.optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
