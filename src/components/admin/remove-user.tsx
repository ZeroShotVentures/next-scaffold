"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  dangerButtonClass,
  errorClass,
  inputClass,
  labelClass,
} from "@/components/settings/styles";
import { admin } from "@/lib/auth-client";
import { useAdminAction } from "./use-admin-action";

type RemoveUserProps = {
  userId: string;
  email: string;
};

export function RemoveUser({ userId, email }: RemoveUserProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const { run, pending, error } = useAdminAction();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () => admin.removeUser({ userId }),
      () => {
        router.replace("/admin");
        router.refresh();
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="remove-confirmation" className={labelClass}>
          Type {email} to confirm
        </label>
        <input
          id="remove-confirmation"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          required
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button
        type="submit"
        disabled={pending || confirmation !== email}
        className={dangerButtonClass}
      >
        {pending ? "Deleting..." : "Delete user"}
      </button>
    </form>
  );
}
