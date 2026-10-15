import { substituteParameters } from "@/lib/templates/parameters";

export function resolvedComposerPrompt(
  draft: string,
  templateBody: string | null,
  parameterValues: Record<string, string>,
): string {
  const trimmed = draft.trim();
  if (!trimmed) return "";
  return templateBody !== null
    ? trimmed
    : substituteParameters(trimmed, parameterValues);
}
