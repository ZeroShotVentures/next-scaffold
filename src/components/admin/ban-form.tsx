"use client";

import { useState } from "react";
import {
  dangerButtonClass,
  errorClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/components/settings/styles";
import { admin } from "@/lib/auth-client";
import { useAdminAction } from "./use-admin-action";

const day = 60 * 60 * 24;

const durations = [
  { label: "1 day", seconds: day },
  { label: "7 days", seconds: 7 * day },
  { label: "30 days", seconds: 30 * day },
  { label: "Permanently", seconds: 0 },
];

type BanFormProps = {
  userId: string;
  banned: boolean;
};

export function BanForm({ userId, banned }: BanFormProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(0);
  const { run, pending, error } = useAdminAction();

  if (banned) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => run(() => admin.unbanUser({ userId }))}
          disabled={pending}
          className={secondaryButtonClass}
        >
          {pending ? "Unbanning..." : "Unban user"}
        </button>
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() =>
      admin.banUser({
        userId,
        banReason: reason.trim() || undefined,
        banExpiresIn: duration || undefined,
      }),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="ban-reason" className={labelClass}>
          Reason (shown to admins only)
        </label>
        <input
          id="ban-reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="ban-duration" className={labelClass}>
          Duration
        </label>
        <select
          id="ban-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className={inputClass}
        >
          {durations.map(({ label, seconds }) => (
            <option key={seconds} value={seconds}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={pending} className={dangerButtonClass}>
        {pending ? "Banning..." : "Ban user"}
      </button>
    </form>
  );
}
