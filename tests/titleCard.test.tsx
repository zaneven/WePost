import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { TitleCard } from '@/components/canvas/TitleCard';
import { TEMPLATES } from '@/core/templates/registry';
import type { CardData, TemplateId } from '@/types/card';

// 单页标题模式封面卡：不渲染正文，逐模板风格适配渲染大标题。

const BASE_DATA: CardData = {
  title: '深度工作的艺术',
  subtitle: 'DEEP WORK',
  tag: '深度阅读',
  content: '这段正文不应出现在封面卡上',
  author: 'WePost 研习社',
  date: '2026.09.01',
  footerText: '记录每一次深度思考',
  templateId: 'minimal-magazine',
  aspectRatio: '3:4',
  fontSize: 'base',
  align: 'left',
  fontFamily: 'sans',
};

describe('TitleCard（单页标题模式封面卡）', () => {
  it('渲染大标题 / 副标题 / 标签 / 署名，不渲染正文内容', () => {
    const { container } = render(<TitleCard data={BASE_DATA} />);
    const html = container.innerHTML;
    expect(html).toContain('深度工作的艺术');
    expect(html).toContain('DEEP WORK');
    expect(html).toContain('深度阅读');
    expect(html).toContain('WePost 研习社');
    expect(html).toContain('记录每一次深度思考');
    expect(html).not.toContain(BASE_DATA.content);
  });

  it('空标题有占位兜底，不产生空封面', () => {
    const { container } = render(
      <TitleCard data={{ ...BASE_DATA, title: '', subtitle: '' }} />
    );
    expect(container.innerHTML).toContain('输入标题');
  });

  it('水印关闭时不渲染水印文字', () => {
    const { container } = render(
      <TitleCard data={{ ...BASE_DATA, showWatermark: false }} />
    );
    expect(container.innerHTML).not.toContain('WEPOST');
  });

  it('全部 10 款模板均有封面风格定义且可正常渲染', () => {
    for (const { id } of TEMPLATES) {
      const { container } = render(
        <TitleCard data={{ ...BASE_DATA, templateId: id as TemplateId }} />
      );
      expect(container.innerHTML).toContain('深度工作的艺术');
    }
  });
});
