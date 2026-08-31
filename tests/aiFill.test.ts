import { describe, it, expect } from 'vitest';
import { sanitizeAiCard, AI_FILL_MAX_CHARS } from '@/lib/aiFill';

describe('sanitizeAiCard', () => {
  it('非对象输入（null / 数组 / 字符串）返回空对象', () => {
    expect(sanitizeAiCard(null)).toEqual({});
    expect(sanitizeAiCard(undefined)).toEqual({});
    expect(sanitizeAiCard(['a'])).toEqual({});
    expect(sanitizeAiCard('card')).toEqual({});
    expect(sanitizeAiCard(123)).toEqual({});
  });

  it('合法字段全部通过（文案 + 枚举风格）', () => {
    const card = sanitizeAiCard({
      title: '晨间思考',
      subtitle: 'THINKING',
      tag: '深度阅读',
      content: '## 要点\n- 第一条',
      author: 'WePost 研习社',
      date: '2026.08.31',
      footerText: '保持专注',
      templateId: 'minimal-magazine',
      aspectRatio: '3:4',
      fontFamily: 'serif',
      fontSize: 'lg',
      align: 'justify',
    });
    expect(card).toEqual({
      title: '晨间思考',
      subtitle: 'THINKING',
      tag: '深度阅读',
      content: '## 要点\n- 第一条',
      author: 'WePost 研习社',
      date: '2026.08.31',
      footerText: '保持专注',
      templateId: 'minimal-magazine',
      aspectRatio: '3:4',
      fontFamily: 'serif',
      fontSize: 'lg',
      align: 'justify',
    });
  });

  it('非法枚举 / 非法类型字段被丢弃，合法字段保留', () => {
    const card = sanitizeAiCard({
      title: 42,
      tag: '   ',
      templateId: 'not-a-template',
      aspectRatio: '16:9',
      fontSize: 'huge',
      align: null,
      content: '保留的正文',
    });
    expect(card).toEqual({ content: '保留的正文' });
  });

  it('文本字段 trim 且超长截断', () => {
    const card = sanitizeAiCard({
      title: '  标题  ',
      content: 'a'.repeat(AI_FILL_MAX_CHARS + 100),
    });
    expect(card.title).toBe('标题');
    expect(card.content).toHaveLength(AI_FILL_MAX_CHARS);
  });

  it('空字符串字段不收（省略即由前端保留原值）', () => {
    expect(sanitizeAiCard({ title: '', content: '   ' })).toEqual({});
  });

  it('未知字段被忽略', () => {
    expect(sanitizeAiCard({ foo: 'bar', content: 'x' })).toEqual({ content: 'x' });
  });
});
