export type GroqModelOption = {
  id: string;
  label: string;
  groqModelId: string;
  description: string;
};

export const GROQ_MODEL_STORAGE_KEY = "promptard:chat-model:v1";

export const DEFAULT_GROQ_MODEL_ID = "gpt-oss-120b";

/** Maps deprecated UI ids (localStorage) to current catalog ids. */
const LEGACY_MODEL_ID_MAP: Record<string, string> = {
  "llama-3.3-70b": "gpt-oss-120b",
  "llama-3.1-8b-instant": "gpt-oss-20b",
  "deepseek-r1-distill-llama-70b": "qwen3.8-27b",
  "gemma2-9b-it": "gpt-oss-20b",
  "qwen-2.5-32b": "qwen3.8-27b",
};

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: "gpt-oss-120b",
    label: "gpt-oss-120b",
    groqModelId: "openai/gpt-oss-120b",
    description:
      "Large general-purpose model. Best default for chat, writing, summarization, and everyday Q&A with strong quality.",
  },
  {
    id: "gpt-oss-20b",
    label: "gpt-oss-20b",
    groqModelId: "openai/gpt-oss-20b",
    description:
      "Faster, lighter model for quick drafts, brainstorming, and short tasks where low latency matters most.",
  },
  {
    id: "qwen3.8-27b",
    label: "qwen3.8-27b",
    groqModelId: "qwen/qwen3.8-27b",
    description:
      "Strong reasoning and multilingual model. Good for detailed answers, technical writing, and multi-step problems.",
  },
  {
    id: "allam-2-7b",
    label: "allam-2-7b",
    groqModelId: "allam-2-7b",
    description:
      "Compact model tuned for Arabic and multilingual use. Efficient for simpler prompts and quick replies.",
  },
  {
    id: "gpt-oss-safeguard-20b",
    label: "gpt-oss-safeguard-20b",
    groqModelId: "openai/gpt-oss-safeguard-20b",
    description:
      "Safety-oriented variant for content that needs stricter policy alignment and cautious phrasing.",
  },
];

export function getGroqModelById(id: string): GroqModelOption | undefined {
  return GROQ_MODELS.find((m) => m.id === id);
}

function normalizeModelId(id: string): string {
  const migrated = LEGACY_MODEL_ID_MAP[id] ?? id;
  return getGroqModelById(migrated) ? migrated : DEFAULT_GROQ_MODEL_ID;
}

export function readStoredGroqModelId(): string {
  if (typeof window === "undefined") return DEFAULT_GROQ_MODEL_ID;
  const stored = localStorage.getItem(GROQ_MODEL_STORAGE_KEY);
  if (!stored) return DEFAULT_GROQ_MODEL_ID;
  return normalizeModelId(stored);
}

export function resolveGroqModelId(modelId: string): string {
  const normalized = normalizeModelId(modelId);
  return getGroqModelById(normalized)?.groqModelId ?? GROQ_MODELS[0].groqModelId;
}
