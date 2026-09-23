"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <nav className="flex items-center gap-1 text-sm">
          {links.map(({ href, label }) => {
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
          })}
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
  );
}
