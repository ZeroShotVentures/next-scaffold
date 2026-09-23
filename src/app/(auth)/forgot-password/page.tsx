import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { emailEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Reset your password" };

export default function Page() {
  if (!emailEnabled) notFound();

  return <ForgotPasswordForm />;
}
