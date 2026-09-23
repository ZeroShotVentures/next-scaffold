import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Stripe } from "stripe";
import { env } from "@/env";
import { sendEmail } from "./email";
import { emailEnabled } from "./features";
import { type PlanName, subscriptionPlans } from "./plans";
import { prisma } from "./prisma";

const billingPlugins = () => {
  if (!env.BILLING_ENABLED) return [];

  const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-08-26.dahlia",
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

  return [
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
  ];
};

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: emailEnabled
      ? async ({ user, url }) => {
          await sendEmail({
            to: user.email,
            subject: "Reset your password",
            text: `Click the link below to reset your password. It expires in 1 hour.\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
          });
        }
      : undefined,
  },
  emailVerification: emailEnabled
    ? {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            text: `Click the link below to verify your email address.\n\n${url}`,
          });
        },
      }
    : undefined,
  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  plugins: billingPlugins(),
});
