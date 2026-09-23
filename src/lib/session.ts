import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

// Call in every page, Server Action and Route Handler that needs a user. The
// proxy only does an optimistic cookie check and is not a security boundary.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export async function isAdmin(user: { id: string; role?: string | null }) {
  const { success } = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      role: (user.role ?? undefined) as "admin" | "user" | undefined,
      permissions: { user: ["list"] },
    },
  });
  return success;
}

// Same contract as requireSession(), for /admin. Non-admins get a 404 so the
// portal's existence isn't revealed. Better Auth re-checks permissions on every
// admin endpoint, so this guards pages, not data.
export async function requireAdmin() {
  const session = await requireSession();
  if (!(await isAdmin(session.user))) notFound();
  return session;
}
