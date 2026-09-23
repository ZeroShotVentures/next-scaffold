// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { resolveEntitlements, unlimited } from "./entitlements";
import { freePlan } from "./plans";

vi.mock("./prisma", () => ({ prisma: {} }));

const billing = { billingEnabled: true };

describe("resolveEntitlements", () => {
  it("grants everything when billing is disabled", () => {
    expect(resolveEntitlements([], { billingEnabled: false })).toEqual(
      unlimited,
    );
  });

  it("falls back to the free plan without a subscription", () => {
    expect(resolveEntitlements([], billing)).toEqual({
      plan: "free",
      limits: freePlan.limits,
    });
  });

  it.each(["active", "trialing"])("grants the plan when %s", (status) => {
    expect(resolveEntitlements([{ plan: "basic", status }], billing).plan).toBe(
      "basic",
    );
  });

  it.each(["canceled", "past_due", "incomplete", "unpaid"])(
    "does not grant the plan when %s",
    (status) => {
      expect(resolveEntitlements([{ plan: "pro", status }], billing).plan).toBe(
        "free",
      );
    },
  );

  it("picks the highest granted plan", () => {
    const result = resolveEntitlements(
      [
        { plan: "pro", status: "active" },
        { plan: "basic", status: "active" },
      ],
      billing,
    );
    expect(result.plan).toBe("pro");
    expect(result.limits.projects).toBe(20);
  });

  it("ignores unknown plans", () => {
    expect(
      resolveEntitlements([{ plan: "legacy", status: "active" }], billing).plan,
    ).toBe("free");
  });
});
