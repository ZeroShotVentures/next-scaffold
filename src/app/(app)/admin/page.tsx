import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { UserBadges } from "@/components/admin/user-badges";
import { inputClass, secondaryButtonClass } from "@/components/settings/styles";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };

const pageSize = 25;

const dateFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function pageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin?${search}` : "/admin";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q.trim().toLowerCase() : "";
  const pageNumber = Math.max(1, Math.floor(Number(page)) || 1);

  const { users, total } = await auth.api.listUsers({
    headers: await headers(),
    query: {
      searchValue: query || undefined,
      searchField: "email",
      searchOperator: "contains",
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {total} {total === 1 ? "user" : "users"}
          {query ? ` matching "${query}"` : ""}
        </p>
      </header>

      <form className="flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by email"
          aria-label="Search by email"
          className={inputClass}
        />
        <button type="submit" className={secondaryButtonClass}>
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {user.name || user.email}
                  </Link>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <UserBadges user={user} />
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {dateFormat.format(new Date(user.createdAt))}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <nav className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            Page {pageNumber} of {pageCount}
          </span>
          <div className="flex gap-2">
            {pageNumber > 1 && (
              <Link
                href={pageHref(query, pageNumber - 1)}
                className={secondaryButtonClass}
              >
                Previous
              </Link>
            )}
            {pageNumber < pageCount && (
              <Link
                href={pageHref(query, pageNumber + 1)}
                className={secondaryButtonClass}
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
