type UserBadgesProps = {
  user: {
    role?: string | null;
    banned?: boolean | null;
    emailVerified: boolean;
  };
};

const badgeClass = "rounded-full px-2 py-0.5 text-xs font-medium";

export function UserBadges({ user }: UserBadgesProps) {
  const roles = (user.role ?? "user").split(",").filter((r) => r !== "user");

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span
          key={role}
          className={`${badgeClass} bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300`}
        >
          {role}
        </span>
      ))}
      {user.banned && (
        <span
          className={`${badgeClass} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300`}
        >
          banned
        </span>
      )}
      {!user.emailVerified && (
        <span
          className={`${badgeClass} bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`}
        >
          unverified
        </span>
      )}
    </div>
  );
}
