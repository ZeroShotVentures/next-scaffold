import type { Metadata } from "next";
import { DeleteAccount } from "@/components/settings/delete-account";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Section } from "@/components/settings/section";
import { secondaryButtonClass } from "@/components/settings/styles";
import { env } from "@/env";
import { emailEnabled } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { describeUserAgent } from "@/lib/user-agent";
import { revokeOtherSessions, revokeSession } from "./actions";

export const metadata: Metadata = { title: "Settings" };

const dateFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function Page() {
  const { user, session } = await requireSession();

  const [accounts, sessions] = await Promise.all([
    prisma.account.findMany({
      where: { userId: user.id },
      select: { providerId: true },
    }),
    prisma.session.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const hasPassword = accounts.some((a) => a.providerId === "credential");
  const otherSessions = sessions.filter((s) => s.id !== session.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your profile, security and account.
        </p>
      </header>

      <Section title="Profile">
        <ProfileForm name={user.name} />
      </Section>

      <Section
        title="Email"
        description={`Your email is ${user.email}${user.emailVerified ? "" : " (not verified)"}.`}
      >
        {emailEnabled ? (
          <EmailForm email={user.email} />
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Changing your email requires email delivery, which isn&apos;t
            configured.
          </p>
        )}
      </Section>

      {hasPassword && (
        <Section
          title="Password"
          description="Changing your password signs out all other devices."
        >
          <PasswordForm />
        </Section>
      )}

      <Section
        title="Sessions"
        description="Devices that are currently signed in to your account."
      >
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {describeUserAgent(s.userAgent)}
                  {s.id === session.id && (
                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {[
                    s.ipAddress,
                    `signed in ${dateFormat.format(s.createdAt)} UTC`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {s.id !== session.id && (
                <form action={revokeSession.bind(null, s.id)}>
                  <button type="submit" className={secondaryButtonClass}>
                    Revoke
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {otherSessions.length > 0 && (
          <form action={revokeOtherSessions} className="mt-4">
            <button type="submit" className={secondaryButtonClass}>
              Sign out all other devices
            </button>
          </form>
        )}
      </Section>

      <Section
        title="Delete account"
        tone="danger"
        description={`Permanently delete your account and all of its data.${
          env.BILLING_ENABLED
            ? " Any active subscription is canceled immediately, without a refund."
            : ""
        } This can't be undone.`}
      >
        <DeleteAccount hasPassword={hasPassword} />
      </Section>
    </div>
  );
}
