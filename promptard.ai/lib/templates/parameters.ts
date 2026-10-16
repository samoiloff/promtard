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
  return `Parameter_${index}`;
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

export function removeParameterFromBody(body: string, name: string): string {
  const pattern = new RegExp(`\\$\\{${escapeRegExp(name)}\\}`, "g");
  return body.replace(pattern, "");
}

export function parameterNamesFromBody(body: string): string[] {
  return parametersFromBody(body).map((param) => param.name);
}

export function formatParameterPlaceholder(name: string): string {
  return `\${${name}}`;
}

export function defaultParameterDisplayValues(
  body: string,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const name of parameterNamesFromBody(body)) {
    values[name] = formatParameterPlaceholder(name);
  }
  return values;
}

export function syncParameterValues(
  body: string,
  previous: Record<string, string>,
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const name of parameterNamesFromBody(body)) {
    next[name] = previous[name] ?? "";
  }
  return next;
}

export type PromptDisplaySegment = { text: string; bold: boolean };

export function promptDisplaySegments(
  draft: string,
  templateBody: string | null,
  parameterValues: Record<string, string>,
): PromptDisplaySegment[] {
  if (templateBody !== null) {
    return substitutedParameterSegments(templateBody, parameterValues);
  }
  return placeholderSyntaxSegments(draft);
}

function substitutedParameterSegments(
  templateBody: string,
  values: Record<string, string>,
): PromptDisplaySegment[] {
  const segments: PromptDisplaySegment[] = [];
  let lastIndex = 0;
  for (const match of templateBody.matchAll(PLACEHOLDER_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({
        text: templateBody.slice(lastIndex, index),
        bold: false,
      });
    }
    const name = match[1]?.trim() ?? "";
    segments.push({ text: values[name] ?? "", bold: true });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < templateBody.length) {
    segments.push({ text: templateBody.slice(lastIndex), bold: false });
  }
  return segments;
}

function placeholderSyntaxSegments(draft: string): PromptDisplaySegment[] {
  const segments: PromptDisplaySegment[] = [];
  let lastIndex = 0;
  for (const match of draft.matchAll(PLACEHOLDER_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: draft.slice(lastIndex, index), bold: false });
    }
    segments.push({ text: match[0], bold: true });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < draft.length) {
    segments.push({ text: draft.slice(lastIndex), bold: false });
  }
  if (segments.length === 0 && draft.length > 0) {
    segments.push({ text: draft, bold: false });
  }
  return segments;
}

export function substituteParameters(
  body: string,
  values: Record<string, string>,
): string {
  let result = body;
  for (const name of parameterNamesFromBody(body)) {
    const pattern = new RegExp(`\\$\\{${escapeRegExp(name)}\\}`, "g");
    result = result.replace(pattern, values[name] ?? "");
  }
  return result;
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
