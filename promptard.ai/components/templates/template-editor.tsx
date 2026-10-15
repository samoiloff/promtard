"use client";

import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { LoginModal } from "@/components/auth/login-modal";
import { showToast } from "@/components/chat/toast";
import { SaveIcon } from "@/components/icons/save-icon";
import { fetchJson, readJsonResponse } from "@/lib/api/read-json-response";
import { TEMPLATE_DRAFT_BODY_KEY } from "@/lib/templates/constants";
import {
  appendParameterToBody,
  createParameterId,
  defaultParameterName,
  insertPlaceholderAtCursor,
  parametersFromBody,
  renameParameterInBody,
} from "@/lib/templates/parameters";
import type { TemplateParameter } from "@/lib/templates/types";
import {
  formatTagsInput,
  parseTagsInput,
  templateBodySchema,
} from "@/lib/templates/validation";

type TemplateEditorProps = {
  mode: "create" | "edit";
  templateId?: string;
  initialBody?: string;
  initialTags?: string[];
  initialIsPublic?: boolean;
};

function createInitialEditorState(
  mode: "create" | "edit",
  initialBody: string,
  initialTags: string[],
) {
  let body = initialBody;
  if (mode === "create" && typeof window !== "undefined") {
    const draft = sessionStorage.getItem(TEMPLATE_DRAFT_BODY_KEY);
    if (draft) {
      sessionStorage.removeItem(TEMPLATE_DRAFT_BODY_KEY);
      body = draft;
    }
  }
  return {
    body,
    tagsInput: formatTagsInput(initialTags),
    parameters: parametersFromBody(body),
  };
}

export function TemplateEditor({
  mode,
  templateId,
  initialBody = "",
  initialTags = [],
  initialIsPublic = true,
}: TemplateEditorProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const [initial] = useState(() =>
    createInitialEditorState(mode, initialBody, initialTags),
  );
  const [body, setBody] = useState(initial.body);
  const [tagsInput, setTagsInput] = useState(initial.tagsInput);
  const [parameters, setParameters] = useState<TemplateParameter[]>(
    initial.parameters,
  );
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  function handleAddParameter() {
    const index = parameters.length + 1;
    const name = defaultParameterName(index);
    const nextBody = appendParameterToBody(body, name);
    setBody(nextBody);
    setParameters((prev) => [...prev, { id: createParameterId(), name }]);
    promptRef.current?.focus();
  }

  function handleParameterNameChange(id: string, nextName: string) {
    const param = parameters.find((p) => p.id === id);
    if (!param) return;

    const oldName = param.name;
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: nextName } : p)),
    );
    if (oldName !== nextName) {
      setBody((prev) => renameParameterInBody(prev, oldName, nextName));
    }
  }

  function handleInsertParameter(name: string) {
    const el = promptRef.current;
    if (!el) return;
    const { body: nextBody, cursor } = insertPlaceholderAtCursor(
      body,
      name,
      el.selectionStart,
      el.selectionEnd,
    );
    setBody(nextBody);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function persist(action: "create" | "update" | "delete") {
    if (!session?.user) {
      setLoginOpen(true);
      return;
    }

    if (action === "delete") {
      if (!templateId) return;
      if (!window.confirm("Delete this template?")) return;
      setSaving(true);
      setError(null);
      try {
        const response = await fetch(`/api/prompt-templates/${templateId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await readJsonResponse<{ error?: string }>(response);
          throw new Error(data.error ?? "Failed to delete");
        }
        showToast("Template deleted");
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setSaving(false);
      }
      return;
    }

    const parsedBody = templateBodySchema.safeParse(body);
    if (!parsedBody.success) {
      setError(parsedBody.error.issues[0]?.message ?? "Invalid prompt");
      return;
    }

    const tags = parseTagsInput(tagsInput);
    setSaving(true);
    setError(null);

    try {
      if (action === "create") {
        const { response, data } = await fetchJson<{
          item?: { id: string };
          error?: string;
        }>("/api/prompt-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: parsedBody.data,
            tags,
            isPublic,
          }),
        });
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to save");
        }
        showToast("Template created");
        if (data.item?.id) {
          router.replace(`/templates/${data.item.id}/edit`);
        }
        return;
      }

      if (!templateId) return;
      const { response, data } = await fetchJson<{ error?: string }>(
        `/api/prompt-templates/${templateId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: parsedBody.data,
            tags,
            isPublic,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save");
      }
      showToast("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const isLoadingSession = status === "loading";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">
            {mode === "create" ? "New prompt template" : "Edit template"}
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Back
          </Link>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prompt
          </span>
          <textarea
            ref={promptRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Template text with ${name} placeholders"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tags
          </span>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="comma-separated, e.g. cars, country"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Public
          </span>
          <span className="text-xs text-zinc-500">
            (visible in Recent, Popular, and search)
          </span>
        </label>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Prompt parameters
            </h2>
            <button
              type="button"
              onClick={handleAddParameter}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Add parameter
            </button>
          </div>

          {parameters.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Add a parameter — a{" "}
              <code className="text-xs">${"{name}"}</code> placeholder will be
              appended to the prompt
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {parameters.map((param) => (
                <li
                  key={param.id}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) =>
                      handleParameterNameChange(param.id, e.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    aria-label={`Parameter name ${param.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleInsertParameter(param.name)}
                    className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium transition hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
                  >
                    Insert into prompt
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pb-6">
          <button
            type="button"
            disabled={saving || isLoadingSession}
            onClick={() =>
              persist(mode === "create" ? "create" : "update")
            }
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {saving ? (
              "…"
            ) : (
              <>
                <SaveIcon className="shrink-0" />
                Save
              </>
            )}
          </button>
          {mode === "edit" ? (
            <button
              type="button"
              disabled={saving || isLoadingSession}
              onClick={() => persist("delete")}
              className="rounded-full border border-red-300 px-6 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </Suspense>
    </div>
  );
}
