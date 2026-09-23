"use client";

import { useEffect, useState } from "react";
import { signOut, subscription } from "@/lib/auth-client";
import { type SubscriptionPlan, subscriptionPlans } from "@/lib/plans";

type SessionLike = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
};

type ActiveSubscription = {
  id: string;
  plan: string;
  status: string;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  periodEnd?: string | Date;
  trialEnd?: string | Date;
};

type DashboardProps = {
  session: SessionLike;
};

export function Dashboard({ session }: DashboardProps) {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [managing, setManaging] = useState<"portal" | "cancel" | null>(null);
  const [active, setActive] = useState<ActiveSubscription | null>(null);
  const [loadingActive, setLoadingActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { data, error: listError } = await subscription.list();
        if (cancelled) return;
        if (listError) {
          setError(listError.message ?? "Failed to load subscription");
          return;
        }
        const current = (data ?? []).find(
          (s) => s.status === "active" || s.status === "trialing",
        );
        setActive((current as ActiveSubscription | undefined) ?? null);
      } catch {
        if (!cancelled) setError("Failed to load subscription");
      } finally {
        if (!cancelled) setLoadingActive(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setError("");
    setLoadingPlan(plan.name);
    try {
      const { error: upgradeError } = await subscription.upgrade({
        plan: plan.name,
        annual,
        successUrl: "/?success=true",
        cancelUrl: "/?canceled=true",
        subscriptionId: active?.stripeSubscriptionId,
      });
      if (upgradeError) {
        setError(upgradeError.message ?? "Unable to start checkout");
      }
    } catch {
      setError("Unable to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleBillingPortal = async () => {
    setError("");
    setManaging("portal");
    try {
      const { error: portalError } = await subscription.billingPortal({
        returnUrl: "/",
      });
      if (portalError) {
        setError(portalError.message ?? "Unable to open billing portal");
      }
    } catch {
      setError("Unable to open billing portal");
    } finally {
      setManaging(null);
    }
  };

  const handleCancel = async () => {
    if (!active) return;
    setError("");
    setManaging("cancel");
    try {
      const { error: cancelError } = await subscription.cancel({
        returnUrl: "/",
        subscriptionId: active.stripeSubscriptionId,
      });
      if (cancelError) {
        setError(cancelError.message ?? "Unable to cancel subscription");
      }
    } catch {
      setError("Unable to cancel subscription");
    } finally {
      setManaging(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Signed in as{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {session.user.email}
              </span>
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </header>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Current subscription
          </h2>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {loadingActive ? (
              <p className="text-sm text-zinc-500">Loading...</p>
            ) : active ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-50">
                    {active.plan}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Status: <span className="capitalize">{active.status}</span>
                    {active.cancelAtPeriodEnd && " · cancels at period end"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBillingPortal}
                    disabled={managing !== null}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {managing === "portal" ? "Opening..." : "Manage billing"}
                  </button>
                  {!active.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancel}
                      disabled={managing !== null}
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {managing === "cancel" ? "Canceling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No active subscription. Choose a plan below to get started.
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Plans
            </h2>
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  !annual
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  annual
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {subscriptionPlans.map((plan) => {
              const isCurrent = active?.plan === plan.name;
              const price =
                annual && plan.annualPrice !== undefined
                  ? plan.annualPrice
                  : plan.monthlyPrice;
              const interval = annual ? "year" : "month";
              return (
                <div
                  key={plan.name}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {plan.displayName}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {plan.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                      ${price}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      /{interval}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loadingPlan !== null || isCurrent}
                    className="mt-8 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {isCurrent
                      ? "Current plan"
                      : loadingPlan === plan.name
                        ? "Redirecting..."
                        : active
                          ? `Switch to ${plan.displayName}`
                          : `Subscribe to ${plan.displayName}`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
