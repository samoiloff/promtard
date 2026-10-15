import { BrowseTemplateFeed } from "@/components/browse/browse-template-feed";

export default function BrowsePopularPage() {
  return (
    <BrowseTemplateFeed
      title="Popular templates"
      emptyMessage="No templates with likes yet."
      endpoint="/api/prompt-templates/public/popular"
    />
  );
}
