import { notFound } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { emailEnabled } from "@/lib/features";

export default function Page() {
  if (!emailEnabled) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <ForgotPasswordForm />
    </div>
  );
}
