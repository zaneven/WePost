// WePost Publisher Core Interface
import type { Article, PublishResult } from '../types';

export interface IPublisher {
  readonly platformId: string;
  readonly platformName: string;

  publish(article: Article): Promise<PublishResult>;
}
