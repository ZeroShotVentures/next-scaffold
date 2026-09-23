import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";
import { env } from "@/env";
import { emailEnabled } from "@/lib/features";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

const checkoutResults = ["success", "canceled"] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { user } = await requireSession();
  const { checkout } = await searchParams;
  const checkoutResult =
    checkoutResults.find((result) => result === checkout) ?? null;

  return (
    <Dashboard
      user={{
        email: user.email,
        emailVerified: user.emailVerified,
      }}
      billingEnabled={env.BILLING_ENABLED}
      emailEnabled={emailEnabled}
      checkout={checkoutResult}
    />
  );
}
