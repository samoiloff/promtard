"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  defaultParameterDisplayValues,
  substituteParameters,
  syncParameterValues,
} from "@/lib/templates/parameters";

type PromptComposerContextValue = {
  draft: string;
  setDraft: (value: string) => void;
  applyFromHistory: (content: string) => void;
  activeTemplateId: string | null;
  canEditActiveTemplate: boolean;
  templateBody: string | null;
  parameterValues: Record<string, string>;
  setParameterValue: (name: string, value: string) => void;
  loadTemplateForHome: (id: string, body: string, canEdit: boolean) => void;
  clearActiveTemplate: () => void;
  resetHomeComposer: () => void;
};

const PromptComposerContext = createContext<PromptComposerContextValue | null>(
  null,
);

export function PromptComposerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraftState] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
    null,
  );
  const [canEditActiveTemplate, setCanEditActiveTemplate] = useState(false);
  const [parameterValues, setParameterValues] = useState<
    Record<string, string>
  >({});
  const [templateBody, setTemplateBody] = useState<string | null>(null);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
    setParameterValues((prev) => syncParameterValues(value, prev));
    setTemplateBody((prev) => (prev !== null ? value : null));
  }, []);

  const applyFromHistory = useCallback((content: string) => {
    setActiveTemplateId(null);
    setCanEditActiveTemplate(false);
    setTemplateBody(null);
    setDraftState(content);
    setParameterValues(syncParameterValues(content, {}));
  }, []);

  const setParameterValue = useCallback((name: string, value: string) => {
    setParameterValues((prev) => {
      const next = { ...prev, [name]: value };
      setTemplateBody((body) => {
        if (body !== null) {
          setDraftState(substituteParameters(body, next));
        }
        return body;
      });
      return next;
    });
  }, []);

  const loadTemplateForHome = useCallback(
    (id: string, body: string, canEdit: boolean) => {
      const values = defaultParameterDisplayValues(body);
      setActiveTemplateId(id);
      setCanEditActiveTemplate(canEdit);
      setTemplateBody(body);
      setParameterValues(values);
      setDraftState(substituteParameters(body, values));
    },
    [],
  );

  const clearActiveTemplate = useCallback(() => {
    setActiveTemplateId(null);
    setCanEditActiveTemplate(false);
    setTemplateBody(null);
    setParameterValues({});
  }, []);

  const resetHomeComposer = useCallback(() => {
    setActiveTemplateId(null);
    setCanEditActiveTemplate(false);
    setTemplateBody(null);
    setParameterValues({});
    setDraftState("");
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      applyFromHistory,
      activeTemplateId,
      canEditActiveTemplate,
      templateBody,
      parameterValues,
      setParameterValue,
      loadTemplateForHome,
      clearActiveTemplate,
      resetHomeComposer,
    }),
    [
      draft,
      setDraft,
      applyFromHistory,
      activeTemplateId,
      canEditActiveTemplate,
      templateBody,
      parameterValues,
      setParameterValue,
      loadTemplateForHome,
      clearActiveTemplate,
      resetHomeComposer,
    ],
  );

  return (
    <PromptComposerContext.Provider value={value}>
      {children}
    </PromptComposerContext.Provider>
  );
}

export function usePromptComposer() {
  const ctx = useContext(PromptComposerContext);
  if (!ctx) {
    throw new Error("usePromptComposer must be used within PromptComposerProvider");
  }
  return ctx;
}
