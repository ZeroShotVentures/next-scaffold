"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changePassword } from "@/lib/auth-client";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  successClass,
} from "./styles";

export function PasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("saving");
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (res.error) {
        setError(res.error.message ?? "Unable to change password");
        setStatus("idle");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="current-password" className={labelClass}>
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="new-password" className={labelClass}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      {status === "saved" && (
        <p className={successClass}>
          Password changed. Other devices have been signed out.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "saving"}
        className={primaryButtonClass}
      >
        {status === "saving" ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
