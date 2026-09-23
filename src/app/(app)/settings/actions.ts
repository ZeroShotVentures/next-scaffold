"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function revokeSession(sessionId: string) {
  const { session } = await requireSession();
  const target = await prisma.session.findFirst({
    where: { id: sessionId, userId: session.userId },
    select: { token: true },
  });
  if (!target || sessionId === session.id) return;

  await auth.api.revokeSession({
    headers: await headers(),
    body: { token: target.token },
  });
  refresh();
}

export async function revokeOtherSessions() {
  await requireSession();
  await auth.api.revokeOtherSessions({ headers: await headers() });
  refresh();
}
