import { BrowseTemplateFeed } from "@/components/browse/browse-template-feed";

export default function BrowsePopularPage() {
  return (
    <BrowseTemplateFeed
      title="Популярные шаблоны"
      emptyMessage="Пока нет шаблонов с лайками."
      endpoint="/api/prompt-templates/public/popular"
    />
  );
}
