export const IMPORT_TAB_KEY = "import" as const;

export type AdminTableKey =
  | "users"
  | "prompt_templates"
  | "prompt_history"
  | "tags"
  | "prompt_template_tags"
  | "prompt_template_likes"
  | "prompt_template_favorites"
  | "accounts"
  | "sessions"
  | "verification_tokens";

export type AdminColumnType = "text" | "boolean" | "integer" | "datetime";

export type AdminColumnDef = {
  key: string;
  label: string;
  type: AdminColumnType;
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
};

export type AdminTableDef = {
  key: AdminTableKey;
  label: string;
  primaryKey: string[];
  columns: AdminColumnDef[];
};

export const ADMIN_TABLE_ORDER: AdminTableKey[] = [
  "users",
  "prompt_templates",
  "prompt_history",
  "tags",
  "prompt_template_tags",
  "prompt_template_likes",
  "prompt_template_favorites",
  "accounts",
  "sessions",
  "verification_tokens",
];

const usersColumns: AdminColumnDef[] = [
  { key: "id", label: "ID", type: "text" },
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "emailVerified", label: "Email verified", type: "datetime" },
  { key: "image", label: "Image URL", type: "text" },
];

const promptTemplatesColumns: AdminColumnDef[] = [
  { key: "id", label: "ID", type: "text", readOnly: true },
  { key: "authorId", label: "Author ID", type: "text", required: true },
  { key: "title", label: "Title", type: "text" },
  { key: "body", label: "Body", type: "text", required: true },
  { key: "isPrivate", label: "Private", type: "boolean" },
  { key: "createdAt", label: "Created", type: "datetime", readOnly: true },
  { key: "updatedAt", label: "Updated", type: "datetime", readOnly: true },
];

const promptHistoryColumns: AdminColumnDef[] = [
  { key: "id", label: "ID", type: "text", readOnly: true },
  { key: "userId", label: "User ID", type: "text", required: true },
  { key: "content", label: "Content", type: "text", required: true },
  { key: "createdAt", label: "Created", type: "datetime", readOnly: true },
];

const tagsColumns: AdminColumnDef[] = [
  { key: "id", label: "ID", type: "text", readOnly: true },
  { key: "name", label: "Name", type: "text", required: true },
];

const templateTagsColumns: AdminColumnDef[] = [
  { key: "templateId", label: "Template ID", type: "text", required: true },
  { key: "tagId", label: "Tag ID", type: "text", required: true },
];

const likesColumns: AdminColumnDef[] = [
  { key: "userId", label: "User ID", type: "text", required: true },
  { key: "templateId", label: "Template ID", type: "text", required: true },
  { key: "createdAt", label: "Created", type: "datetime", readOnly: true },
];

const favoritesColumns: AdminColumnDef[] = [
  { key: "userId", label: "User ID", type: "text", required: true },
  { key: "templateId", label: "Template ID", type: "text", required: true },
  { key: "createdAt", label: "Created", type: "datetime", readOnly: true },
];

const accountsColumns: AdminColumnDef[] = [
  { key: "userId", label: "User ID", type: "text", required: true },
  { key: "type", label: "Type", type: "text", required: true },
  { key: "provider", label: "Provider", type: "text", required: true },
  { key: "providerAccountId", label: "Provider account ID", type: "text", required: true },
  { key: "expires_at", label: "Expires at", type: "integer" },
  { key: "token_type", label: "Token type", type: "text" },
  { key: "scope", label: "Scope", type: "text" },
  { key: "session_state", label: "Session state", type: "text" },
  {
    key: "refresh_token",
    label: "Refresh token",
    type: "text",
    hidden: true,
    readOnly: true,
  },
  {
    key: "access_token",
    label: "Access token",
    type: "text",
    hidden: true,
    readOnly: true,
  },
  {
    key: "id_token",
    label: "ID token",
    type: "text",
    hidden: true,
    readOnly: true,
  },
];

const sessionsColumns: AdminColumnDef[] = [
  { key: "sessionToken", label: "Session token", type: "text", required: true },
  { key: "userId", label: "User ID", type: "text", required: true },
  { key: "expires", label: "Expires", type: "datetime", required: true },
];

const verificationTokensColumns: AdminColumnDef[] = [
  { key: "identifier", label: "Identifier", type: "text", required: true },
  { key: "token", label: "Token", type: "text", required: true },
  { key: "expires", label: "Expires", type: "datetime", required: true },
];

export const ADMIN_TABLES: Record<AdminTableKey, AdminTableDef> = {
  users: {
    key: "users",
    label: "Users",
    primaryKey: ["id"],
    columns: usersColumns,
  },
  prompt_templates: {
    key: "prompt_templates",
    label: "Templates",
    primaryKey: ["id"],
    columns: promptTemplatesColumns,
  },
  prompt_history: {
    key: "prompt_history",
    label: "History",
    primaryKey: ["id"],
    columns: promptHistoryColumns,
  },
  tags: {
    key: "tags",
    label: "Tags",
    primaryKey: ["id"],
    columns: tagsColumns,
  },
  prompt_template_tags: {
    key: "prompt_template_tags",
    label: "Template tags",
    primaryKey: ["templateId", "tagId"],
    columns: templateTagsColumns,
  },
  prompt_template_likes: {
    key: "prompt_template_likes",
    label: "Likes",
    primaryKey: ["userId", "templateId"],
    columns: likesColumns,
  },
  prompt_template_favorites: {
    key: "prompt_template_favorites",
    label: "Favorites",
    primaryKey: ["userId", "templateId"],
    columns: favoritesColumns,
  },
  accounts: {
    key: "accounts",
    label: "Accounts",
    primaryKey: ["provider", "providerAccountId"],
    columns: accountsColumns,
  },
  sessions: {
    key: "sessions",
    label: "Sessions",
    primaryKey: ["sessionToken"],
    columns: sessionsColumns,
  },
  verification_tokens: {
    key: "verification_tokens",
    label: "Verification tokens",
    primaryKey: ["identifier", "token"],
    columns: verificationTokensColumns,
  },
};

export function getAdminTable(key: string): AdminTableDef | null {
  if (key in ADMIN_TABLES) {
    return ADMIN_TABLES[key as AdminTableKey];
  }
  return null;
}

export function listAdminTablesForApi(): { key: AdminTableKey; label: string }[] {
  return ADMIN_TABLE_ORDER.map((key) => ({
    key,
    label: ADMIN_TABLES[key].label,
  }));
}

export const DEFAULT_ADMIN_TAB: AdminTableKey = "users";

export function parseAdminTabParam(
  tab: string | null | undefined,
): AdminTableKey | typeof IMPORT_TAB_KEY {
  if (tab === IMPORT_TAB_KEY) return IMPORT_TAB_KEY;
  if (tab && tab in ADMIN_TABLES) return tab as AdminTableKey;
  return DEFAULT_ADMIN_TAB;
}
