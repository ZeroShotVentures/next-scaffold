import { cache } from "react";
import { env } from "@/env";
import {
  freePlan,
  type PlanLimits,
  type PlanName,
  subscriptionPlans,
} from "./plans";
import { prisma } from "./prisma";

export type Entitlements = {
  plan: PlanName | "free" | "unlimited";
  limits: PlanLimits;
};

type SubscriptionLike = { plan: string; status: string };

export const unlimited: Entitlements = {
  plan: "unlimited",
  limits: { projects: Infinity, storage: Infinity },
};

const grantingStatuses = new Set(["active", "trialing"]);

// Single source of truth for "what may this user do". Change the policy here
// (free tier, grandfathering, trials) instead of checking subscriptions inline.
export function resolveEntitlements(
  subscriptions: SubscriptionLike[],
  { billingEnabled }: { billingEnabled: boolean },
): Entitlements {
  if (!billingEnabled) return unlimited;

  const granted = subscriptionPlans.filter((plan) =>
    subscriptions.some(
      (s) => s.plan === plan.name && grantingStatuses.has(s.status),
    ),
  );
  const best = granted.at(-1);
  if (!best) return { plan: "free", limits: freePlan.limits };

  return { plan: best.name, limits: best.limits };
}

export const getEntitlements = cache(
  async (userId: string): Promise<Entitlements> => {
    if (!env.BILLING_ENABLED) return unlimited;

    const subscriptions = await prisma.subscription.findMany({
      where: { referenceId: userId },
      select: { plan: true, status: true },
    });
    return resolveEntitlements(subscriptions, { billingEnabled: true });
  },
);
