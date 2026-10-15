import { BrowseTemplateFeed } from "@/components/browse/browse-template-feed";

export default function BrowseRecentPage() {
  return (
    <BrowseTemplateFeed
      title="Последние шаблоны"
      emptyMessage="Публичных шаблонов пока нет."
      endpoint="/api/prompt-templates/public/recent"
    />
  );
}
