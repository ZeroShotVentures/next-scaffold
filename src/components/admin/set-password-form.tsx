"use client";

import { useState } from "react";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  successClass,
} from "@/components/settings/styles";
import { admin } from "@/lib/auth-client";
import { useAdminAction } from "./use-admin-action";

export function SetPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const { run, pending, error } = useAdminAction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const ok = await run(() =>
      admin.setUserPassword({ userId, newPassword: password }),
    );
    if (ok) {
      setPassword("");
      setSaved(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="admin-new-password" className={labelClass}>
          New password
        </label>
        <input
          id="admin-new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      {saved && <p className={successClass}>Password updated.</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Saving..." : "Set password"}
      </button>
    </form>
  );
}
