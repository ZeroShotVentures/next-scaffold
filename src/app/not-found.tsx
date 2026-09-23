import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <div className="max-w-sm space-y-4 text-center">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          404
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Page not found
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
