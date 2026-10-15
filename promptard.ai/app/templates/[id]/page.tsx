import { TemplateViewLoader } from "./template-view-loader";

export const instant = false;

export default async function TemplateViewPage({
  params,
}: PageProps<"/templates/[id]">) {
  const { id } = await params;
  return <TemplateViewLoader templateId={id} />;
}
