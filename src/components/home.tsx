"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth-form";
import { Dashboard } from "@/components/dashboard";
import { useSession } from "@/lib/auth-client";

type HomeProps = {
  billingEnabled: boolean;
  googleEnabled: boolean;
  emailEnabled: boolean;
};

export function Home({
  billingEnabled,
  googleEnabled,
  emailEnabled,
}: HomeProps) {
  const { data: session, isPending } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (session) {
    return (
      <Dashboard
        session={session}
        billingEnabled={billingEnabled}
        emailEnabled={emailEnabled}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <AuthForm
        isSignUp={isSignUp}
        onToggle={() => setIsSignUp(!isSignUp)}
        googleEnabled={googleEnabled}
        emailEnabled={emailEnabled}
      />
    </div>
  );
}
