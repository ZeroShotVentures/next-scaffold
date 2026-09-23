import { env } from "@/env";

export const googleEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

// Without Resend, emails are only logged, which must never happen in production.
export const emailEnabled =
  Boolean(env.RESEND_API_KEY) || env.NODE_ENV !== "production";
