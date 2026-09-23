import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { z } from "zod";

// Committed defaults. Never overrides variables that are already set (.env, .env.local, host env).
config({ path: ".env.example", quiet: true });

const authSecret = z.string().min(32);

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
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? authSecret
        : authSecret.default("dev-only-secret-never-use-in-production"),
    BETTER_AUTH_URL: z.url(),
    BILLING_ENABLED: z.stringbool().default(false),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    STRIPE_PRICE_BASIC_MONTHLY: priceId.optional(),
    STRIPE_PRICE_BASIC_ANNUAL: priceId.optional(),
    STRIPE_PRICE_PRO_MONTHLY: priceId.optional(),
    STRIPE_PRICE_PRO_ANNUAL: priceId.optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().startsWith("re_").optional(),
    EMAIL_FROM: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  createFinalSchema: (shape) =>
    z
      .object(shape)
      .superRefine((values, ctx) => {
        if (!values.GOOGLE_CLIENT_ID !== !values.GOOGLE_CLIENT_SECRET) {
          const missing = values.GOOGLE_CLIENT_ID
            ? "GOOGLE_CLIENT_SECRET"
            : "GOOGLE_CLIENT_ID";
          ctx.addIssue({
            code: "custom",
            path: [missing],
            message: "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
          });
        }
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
