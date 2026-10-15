import { EditTemplateLoader } from "./edit-template-loader";

export const instant = false;

export default async function EditTemplatePage({
  params,
}: PageProps<"/templates/[id]/edit">) {
  const { id } = await params;
  return <EditTemplateLoader templateId={id} />;
}
