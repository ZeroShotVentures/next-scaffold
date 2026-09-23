"use client";

import { useState } from "react";
import {
  errorClass,
  inputClass,
  primaryButtonClass,
} from "@/components/settings/styles";
import { admin } from "@/lib/auth-client";
import { useAdminAction } from "./use-admin-action";

const roles = ["user", "admin"] as const;
type Role = (typeof roles)[number];

export function RoleForm({ userId, role }: { userId: string; role: string }) {
  const current = roles.find((r) => r === role) ?? "user";
  const [value, setValue] = useState<Role>(current);
  const { run, pending, error } = useAdminAction();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => admin.setRole({ userId, role: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-wrap gap-2">
      <select
        aria-label="Role"
        value={value}
        onChange={(e) => setValue(e.target.value as Role)}
        className={`${inputClass} w-auto flex-1`}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending || value === current}
        className={primaryButtonClass}
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {error && <p className={`${errorClass} w-full`}>{error}</p>}
    </form>
  );
}
