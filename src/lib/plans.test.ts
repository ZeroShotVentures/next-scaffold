import { describe, expect, it } from "vitest";
import { subscriptionPlans } from "./plans";

describe("subscriptionPlans", () => {
  it("has unique plan names", () => {
    const names = subscriptionPlans.map((plan) => plan.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(subscriptionPlans)("$name has a positive monthly price", (plan) => {
    expect(plan.monthlyPrice).toBeGreaterThan(0);
  });

  it.each(subscriptionPlans.filter((plan) => plan.annualPrice !== undefined))(
    "$name annual price is cheaper than 12 monthly payments",
    (plan) => {
      expect(plan.annualPrice).toBeLessThan(plan.monthlyPrice * 12);
    },
  );

  it.each(subscriptionPlans)("$name lists at least one feature", (plan) => {
    expect(plan.features.length).toBeGreaterThan(0);
  });
});
