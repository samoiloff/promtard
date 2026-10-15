export type TemplateParameter = {
  id: string;
  name: string;
};

export type PromptTemplateItem = {
  id: string;
  title: string | null;
  body: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicTemplateListItem = {
  id: string;
  title: string | null;
  bodyPreview: string;
  authorName: string | null;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
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
