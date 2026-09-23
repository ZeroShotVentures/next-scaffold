import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Stripe } from "stripe";
import { env } from "@/src/env";
import { type PlanName, subscriptionPlans } from "./plans";
import { prisma } from "./prisma";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
});

const stripePrices: Record<
  PlanName,
  { priceId: string; annualDiscountPriceId?: string }
> = {
  basic: {
    priceId: env.STRIPE_PRICE_BASIC_MONTHLY,
    annualDiscountPriceId: env.STRIPE_PRICE_BASIC_ANNUAL,
  },
  pro: {
    priceId: env.STRIPE_PRICE_PRO_MONTHLY,
    annualDiscountPriceId: env.STRIPE_PRICE_PRO_ANNUAL,
  },
};

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: subscriptionPlans.map(({ name, limits }) => ({
          name,
          limits,
          priceId: stripePrices[name].priceId,
          annualDiscountPriceId: stripePrices[name].annualDiscountPriceId,
        })),
      },
    }),
  ],
});
