"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateUser } from "@/lib/auth-client";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  successClass,
} from "./styles";

export function ProfileForm({ name: initialName }: { name: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("saving");
    try {
      const res = await updateUser({ name });
      if (res.error) {
        setError(res.error.message ?? "Unable to update profile");
        setStatus("idle");
        return;
      }
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
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus("idle");
          }}
          required
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      {status === "saved" && <p className={successClass}>Profile updated.</p>}
      <button
        type="submit"
        disabled={status === "saving" || name.trim() === initialName}
        className={primaryButtonClass}
      >
        {status === "saving" ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
