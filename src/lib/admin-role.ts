import { env } from "@/env";
import { prisma } from "./prisma";

// ADMIN_EMAILS is the only source of the admin role. A verified email is
// required so nobody can register a listed address first and take the role.
export function roleFor(user: { email: string; emailVerified: boolean }) {
  return user.emailVerified &&
    env.ADMIN_EMAILS.includes(user.email.toLowerCase())
    ? "admin"
    : "user";
}

// Changing ADMIN_EMAILS requires a restart, so running this at startup applies
// additions and removals to existing users.
export async function syncAdminRoles() {
  const listed = { email: { in: env.ADMIN_EMAILS }, emailVerified: true };
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { role: "admin", NOT: listed },
      data: { role: "user" },
    }),
    prisma.user.updateMany({
      where: { ...listed, OR: [{ role: null }, { role: { not: "admin" } }] },
      data: { role: "admin" },
    }),
  ]);
}
