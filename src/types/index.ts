// WePost Core Types
export interface Article {
  id: string;
  title: string;
  content: string;
  author?: string;
  digest?: string;
  coverUrl?: string;
  theme?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishResult {
  success: boolean;
  platform: string;
  externalId?: string;
  url?: string;
  error?: string;
}
