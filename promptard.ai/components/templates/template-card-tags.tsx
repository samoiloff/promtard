import Link from "next/link";

type TemplateCardTagsProps = {
  tags?: string[] | null;
  className?: string;
};

export function TemplateCardTags({ tags, className }: TemplateCardTagsProps) {
  if (!tags?.length) return null;

  return (
    <div className={`mt-2 flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/browse/search?q=${encodeURIComponent(tag)}`}
          className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
