import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Stripe } from "stripe";
import { env } from "@/env";
import { roleFor } from "./admin-role";
import { sendEmail } from "./email";
import { emailEnabled } from "./features";
import { type PlanName, subscriptionPlans } from "./plans";
import { prisma } from "./prisma";

const stripeClient = env.BILLING_ENABLED
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-08-26.dahlia" })
  : null;

const billingPlugins = () => {
  if (!env.BILLING_ENABLED || !stripeClient) return [];

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

const endedStatuses = ["canceled", "incomplete_expired"];

// The Stripe plugin does not react to user deletion, and Stripe keeps charging
// live subscriptions whose user no longer exists.
async function cancelSubscriptions(userId: string) {
  if (!stripeClient) return;
  const live = await prisma.subscription.findMany({
    where: {
      referenceId: userId,
      status: { notIn: endedStatuses },
      stripeSubscriptionId: { not: null },
    },
    select: { stripeSubscriptionId: true },
  });
  await Promise.all(
    live.map(({ stripeSubscriptionId }) =>
      stripeSubscriptionId
        ? stripeClient.subscriptions.cancel(stripeSubscriptionId)
        : null,
    ),
  );
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  rateLimit: {
    storage: "database",
  },
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
  user: {
    changeEmail: {
      enabled: emailEnabled,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Confirm your email change",
          text: `Someone asked to change your email address to ${newEmail}. Click the link below to approve the change.\n\n${url}\n\nIf this wasn't you, ignore this email and change your password.`,
        });
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  // Database hooks (unlike user.deleteUser hooks) also run when an admin
  // removes a user.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { role: roleFor(user) } }),
      },
      // Every user write (email verification, email change, the admin plugin's
      // role endpoints) goes through here, so the role can't drift from
      // ADMIN_EMAILS. Writes through Prisma skip the hook and don't recurse.
      update: {
        after: async (user) => {
          const role = roleFor(user);
          if ((user as { role?: string | null }).role === role) return;
          await prisma.user.update({ where: { id: user.id }, data: { role } });
        },
      },
      delete: {
        before: async (user) => {
          await cancelSubscriptions(user.id);
        },
        after: async (user) => {
          await prisma.subscription.deleteMany({
            where: { referenceId: user.id },
          });
        },
      },
    },
  },
  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  // nextCookies must stay last so it sees cookies set by the other plugins.
  plugins: [
    ...billingPlugins(),
    admin({ impersonationSessionDuration: 60 * 60 }),
    nextCookies(),
  ],
});
