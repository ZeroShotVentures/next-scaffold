export type SubscriptionPlan = {
  name: string;
  displayName: string;
  description: string;
  priceId: string;
  annualDiscountPriceId?: string;
  monthlyPrice: number;
  annualPrice?: number;
  features: string[];
  limits: Record<string, number>;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "basic",
    displayName: "Basic",
    description: "Everything you need to get started.",
    priceId: process.env.STRIPE_PRICE_BASIC_MONTHLY ?? "",
    annualDiscountPriceId: process.env.STRIPE_PRICE_BASIC_ANNUAL,
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
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    annualDiscountPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
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
