export type PlanName = "basic" | "pro";

export type PlanLimits = {
  projects: number;
  storage: number;
};

export type SubscriptionPlan = {
  name: PlanName;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice?: number;
  features: string[];
  limits: PlanLimits;
};

export const freePlan = {
  displayName: "Free",
  limits: {
    projects: 1,
    storage: 1,
  },
} satisfies { displayName: string; limits: PlanLimits };

// Ordered from lowest to highest tier; entitlements pick the last granted plan.
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "basic",
    displayName: "Basic",
    description: "Everything you need to get started.",
    monthlyPrice: 9,
    annualPrice: 90,
    features: ["Up to 5 projects", "10 GB storage", "Community support"],
    limits: {
      projects: 5,
      storage: 10,
    },
  },
  {
    name: "pro",
    displayName: "Pro",
    description: "For growing teams that need more power.",
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      "Up to 20 projects",
      "50 GB storage",
      "Priority support",
      "Advanced analytics",
    ],
    limits: {
      projects: 20,
      storage: 50,
    },
  },
];
