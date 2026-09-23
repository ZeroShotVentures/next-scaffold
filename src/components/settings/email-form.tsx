"use client";

import { useState } from "react";
import { changeEmail } from "@/lib/auth-client";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  successClass,
} from "./styles";

export function EmailForm({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const res = await changeEmail({ newEmail, callbackURL: "/settings" });
      if (res.error) {
        setError(res.error.message ?? "Unable to change email");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <p className={successClass}>
        Check your inbox to confirm the change. Your email stays {email} until
        then.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="new-email" className={labelClass}>
          New email
        </label>
        <input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder={email}
          required
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className={primaryButtonClass}
      >
        {status === "sending" ? "Sending..." : "Change email"}
      </button>
    </form>
  );
}
