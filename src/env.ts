import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const priceId = z.string().startsWith("price_");

const requiredForBilling = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BASIC_MONTHLY",
  "STRIPE_PRICE_PRO_MONTHLY",
] as const;

type BillingEnv =
  | { BILLING_ENABLED: false }
  | {
      BILLING_ENABLED: true;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      STRIPE_PRICE_BASIC_MONTHLY: string;
      STRIPE_PRICE_PRO_MONTHLY: string;
    };

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    BILLING_ENABLED: z.stringbool().default(false),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    STRIPE_PRICE_BASIC_MONTHLY: priceId.optional(),
    STRIPE_PRICE_BASIC_ANNUAL: priceId.optional(),
    STRIPE_PRICE_PRO_MONTHLY: priceId.optional(),
    STRIPE_PRICE_PRO_ANNUAL: priceId.optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  createFinalSchema: (shape) =>
    z
      .object(shape)
      .superRefine((values, ctx) => {
        if (!values.BILLING_ENABLED) return;
        for (const key of requiredForBilling) {
          if (!values[key]) {
            ctx.addIssue({
              code: "custom",
              path: [key],
              message: "Required when BILLING_ENABLED=true",
            });
          }
        }
      })
      .transform((values) => values as typeof values & BillingEnv),
});
