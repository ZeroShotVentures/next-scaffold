"use client";

import { useRouter } from "next/navigation";
import { errorClass, primaryButtonClass } from "@/components/settings/styles";
import { admin } from "@/lib/auth-client";
import { useAdminAction } from "./use-admin-action";

export function ImpersonateButton({ userId }: { userId: string }) {
  const router = useRouter();
  const { run, pending, error } = useAdminAction();

  const handleClick = () =>
    run(
      () => admin.impersonateUser({ userId }),
      () => {
        router.replace("/dashboard");
        router.refresh();
      },
    );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={primaryButtonClass}
      >
        {pending ? "Starting..." : "Impersonate"}
      </button>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
