"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { admin, signOut, useSession } from "@/lib/auth-client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

const adminLink = { href: "/admin", label: "Admin" };

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [stopping, setStopping] = useState(false);

  const showAdmin =
    !!data &&
    admin.checkRolePermission({
      role: (data.user.role ?? "user") as "admin" | "user",
      permissions: { user: ["list"] },
    });
  const impersonating = !!data?.session.impersonatedBy;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  const handleStopImpersonating = async () => {
    if (!data) return;
    setStopping(true);
    const res = await admin.stopImpersonating().catch(() => null);
    if (!res || res.error) {
      setStopping(false);
      return;
    }
    router.replace(`/admin/users/${data.user.id}`);
    router.refresh();
  };

  return (
    <>
      {impersonating && (
        <div className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-2 text-sm">
            <p>
              You are impersonating <strong>{data?.user.email}</strong>. Actions
              you take affect their account.
            </p>
            <button
              type="button"
              onClick={handleStopImpersonating}
              disabled={stopping}
              className="shrink-0 rounded-lg bg-amber-900 px-3 py-1 font-medium text-amber-50 transition-colors hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-300"
            >
              {stopping ? "Stopping..." : "Stop impersonating"}
            </button>
          </div>
        </div>
      )}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-1 text-sm">
            {(showAdmin ? [...links, adminLink] : links).map(
              ({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      active
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              },
            )}
          </nav>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>
    </>
  );
}
