export type TemplateParameter = {
  id: string;
  name: string;
};

export type PromptTemplateItem = {
  id: string;
  title: string | null;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type PromptTemplateListItem = {
  id: string;
  title: string | null;
  bodyPreview: string;
  tags: string[];
  updatedAt: string;
  authorName?: string | null;
};

export type PromptTemplateViewItem = PromptTemplateItem & {
  canEdit: boolean;
};
