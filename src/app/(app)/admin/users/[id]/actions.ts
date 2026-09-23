"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

// Session revocation runs on the server so session tokens never reach the
// browser.
export async function revokeUserSession(userId: string, sessionId: string) {
  await requireAdmin();
  const requestHeaders = await headers();
  const { sessions } = await auth.api.listUserSessions({
    headers: requestHeaders,
    body: { userId },
  });
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return;

  await auth.api.revokeUserSession({
    headers: requestHeaders,
    body: { sessionToken: target.token },
  });
  refresh();
}

export async function revokeUserSessions(userId: string) {
  await requireAdmin();
  await auth.api.revokeUserSessions({
    headers: await headers(),
    body: { userId },
  });
  refresh();
}
