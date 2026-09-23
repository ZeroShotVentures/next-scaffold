type SectionProps = {
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
};

export function Section({
  title,
  description,
  tone = "default",
  children,
}: SectionProps) {
  const border =
    tone === "danger"
      ? "border-red-200 dark:border-red-900"
      : "border-zinc-200 dark:border-zinc-800";

  return (
    <section
      className={`rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 ${border}`}
    >
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}
