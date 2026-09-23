"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUser } from "@/lib/auth-client";
import {
  dangerButtonClass,
  errorClass,
  inputClass,
  labelClass,
} from "./styles";

type DeleteAccountProps = {
  hasPassword: boolean;
};

export function DeleteAccount({ hasPassword }: DeleteAccountProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDeleting(true);
    try {
      const res = await deleteUser(hasPassword ? { password } : {});
      if (res.error) {
        setError(
          res.error.code === "SESSION_EXPIRED"
            ? "For your security, sign out and sign in again before deleting your account."
            : (res.error.message ?? "Unable to delete account"),
        );
        setDeleting(false);
        return;
      }
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      {hasPassword && (
        <div className="space-y-2">
          <label htmlFor="delete-password" className={labelClass}>
            Password
          </label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="delete-confirmation" className={labelClass}>
          Type DELETE to confirm
        </label>
        <input
          id="delete-confirmation"
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
        disabled={deleting || confirmation !== "DELETE"}
        className={dangerButtonClass}
      >
        {deleting ? "Deleting..." : "Delete account"}
      </button>
    </form>
  );
}
