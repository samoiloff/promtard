import Link from "next/link";

import { getTagChipClasses } from "@/lib/templates/tag-chip-palette";

type TagChipProps = {
  tag: string;
  className?: string;
};

export function TagChip({ tag, className }: TagChipProps) {
  return (
    <Link
      href={`/browse/search?q=${encodeURIComponent(tag)}`}
      className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${getTagChipClasses(tag)} ${className ?? ""}`}
    >
      {tag}
    </Link>
  );
}
