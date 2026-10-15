import { BrowseTemplateFeed } from "@/components/browse/browse-template-feed";

export default function BrowseRecentPage() {
  return (
    <BrowseTemplateFeed
      title="Recent templates"
      emptyMessage="No public templates yet."
      endpoint="/api/prompt-templates/public/recent"
    />
  );
}
