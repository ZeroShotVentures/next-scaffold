import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { emailEnabled } from "@/lib/features";

export const metadata: Metadata = { title: "Set a new password" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!emailEnabled) notFound();

  const { token, error } = await searchParams;
  const validToken = typeof token === "string" && !error ? token : null;

  return <ResetPasswordForm token={validToken} />;
}
