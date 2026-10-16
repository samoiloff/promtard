-- System user for admin CSV imports (author_id on prompt_templates).
-- Id must match ADMIN_SYSTEM_USER_ID / lib/admin/constants.ts default.
INSERT INTO "users" ("id", "name", "email")
VALUES (
  'promptard-system-admin',
  'Promptard Admin',
  'admin@internal.promptard'
)
ON CONFLICT ("id") DO NOTHING;
