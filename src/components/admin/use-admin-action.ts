"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Result = { error: { message?: string } | null };

export function useAdminAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Refreshes server components on success unless onSuccess navigates away.
  const run = async (action: () => Promise<Result>, onSuccess?: () => void) => {
    setError("");
    setPending(true);
    try {
      const res = await action();
      if (res.error) {
        setError(res.error.message ?? "Something went wrong");
        return false;
      }
      if (onSuccess) onSuccess();
      else router.refresh();
      return true;
    } catch {
      setError("Something went wrong");
      return false;
    } finally {
      setPending(false);
    }
  };

  return { run, pending, error };
}
