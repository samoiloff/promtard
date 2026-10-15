const LIST_PREVIEW_MAX = 120;

export function previewTemplateBody(body: string, max = LIST_PREVIEW_MAX): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
