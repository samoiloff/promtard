import { TagChip } from "@/components/templates/tag-chip";

type TemplateCardTagsProps = {
  tags?: string[] | null;
  className?: string;
};

export function TemplateCardTags({ tags, className }: TemplateCardTagsProps) {
  if (!tags?.length) return null;

  return (
    <div className={`mt-2 flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <TagChip key={tag} tag={tag} />
      ))}
    </div>
  );
}
