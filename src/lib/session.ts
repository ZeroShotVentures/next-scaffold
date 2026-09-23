import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
