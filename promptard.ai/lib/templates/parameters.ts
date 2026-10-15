import type { TemplateParameter } from "@/lib/templates/types";

const PLACEHOLDER_PATTERN = /\$\{([^}]+)\}/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createParameterId(): string {
  return crypto.randomUUID();
}

export function parametersFromBody(body: string): TemplateParameter[] {
  const seen = new Set<string>();
  const params: TemplateParameter[] = [];
  for (const match of body.matchAll(PLACEHOLDER_PATTERN)) {
    const name = match[1]?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    params.push({ id: createParameterId(), name });
  }
  return params;
}

export function defaultParameterName(index: number): string {
  return `Параметр_${index}`;
}

export function appendParameterToBody(body: string, name: string): string {
  const placeholder = `\${${name}}`;
  if (!body.trim()) return placeholder;
  const needsSpace = !/\s$/.test(body) && !body.endsWith("\n");
  return `${body}${needsSpace ? " " : ""}${placeholder}`;
}

export function renameParameterInBody(
  body: string,
  oldName: string,
  newName: string,
): string {
  if (oldName === newName) return body;
  const pattern = new RegExp(
    `\\$\\{${escapeRegExp(oldName)}\\}`,
    "g",
  );
  return body.replace(pattern, `\${${newName}}`);
}

export function insertPlaceholderAtCursor(
  body: string,
  name: string,
  selectionStart: number,
  selectionEnd: number,
): { body: string; cursor: number } {
  const placeholder = `\${${name}}`;
  const before = body.slice(0, selectionStart);
  const after = body.slice(selectionEnd);
  const nextBody = `${before}${placeholder}${after}`;
  const cursor = selectionStart + placeholder.length;
  return { body: nextBody, cursor };
}
