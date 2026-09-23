import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { emailEnabled, googleEnabled } from "@/lib/features";
import { safeRedirect } from "@/lib/redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const callbackURL = safeRedirect((await searchParams).callbackURL);
  if (await getSession()) redirect(callbackURL);

  return (
    <AuthForm
      mode="sign-in"
      callbackURL={callbackURL}
      googleEnabled={googleEnabled}
      emailEnabled={emailEnabled}
    />
  );
}
