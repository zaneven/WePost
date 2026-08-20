import React, { useMemo } from 'react';
import type { AspectRatioType, CardData, TemplateId } from '@/types/card';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
import { getCanvasDimensions } from '@/core/templates/registry';
import { CardRenderer } from './CardRenderer';

interface TemplateThumbnailProps {
  templateId: TemplateId;
  aspectRatio: AspectRatioType;
  /** 缩略图渲染的目标像素宽度，高度按比例自动计算 */
  width?: number;
}

/**
 * 模板真实预览缩略图。
 * 复用 CardRenderer（与主画板同一套渲染管线），用统一的示例数据，
 * 仅切换 templateId，确保"所选即所得"。整体按目标宽度等比缩放。
 */
export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  templateId,
  aspectRatio,
  width = 120,
}) => {
  const sampleData = useMemo<CardData>(
    () => ({ ...INITIAL_CARD_DATA, templateId, aspectRatio }),
    [templateId, aspectRatio]
  );

  const { width: cw, height: ch } = getCanvasDimensions(aspectRatio);
  const scale = width / cw;
  const containerHeight = ch * scale;

  return (
    <div
      className="relative overflow-hidden rounded-md ring-1 ring-black/5"
      style={{ width, height: containerHeight }}
      aria-hidden="true"
    >
      <div style={{ width: cw, height: ch, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <CardRenderer data={sampleData} />
      </div>
    </div>
  );
};

/**
 * 画面比例可视化缩略图。
 * 用真实比例的矩形轮廓直观展示宽高差异，替代纯文字标注。
 */
export const AspectRatioThumbnail: React.FC<{ ratio: AspectRatioType }> = ({ ratio }) => {
  const { width: cw, height: ch } = getCanvasDimensions(ratio);
  // 以最大边 28px 为基准等比缩小
  const base = 28;
  const max = Math.max(cw, ch);
  const w = Math.round((cw / max) * base);
  const h = Math.round((ch / max) * base);

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: base, height: base }}
      aria-hidden="true"
    >
      <div
        className="rounded-sm border-2 border-current"
        style={{ width: w, height: h }}
      />
    </div>
  );
};
