import { notFound } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { emailEnabled } from "@/lib/features";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!emailEnabled) notFound();

  const { token, error } = await searchParams;
  const validToken = typeof token === "string" && !error ? token : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <ResetPasswordForm token={validToken} />
    </div>
  );
}
