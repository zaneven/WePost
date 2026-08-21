'use client';

import { useEffect, useState } from 'react';
import type { CardData } from '@/types/card';
import { INITIAL_CARD_DATA } from '@/core/templates/registry';
import { CardRenderer } from '@/components/canvas/CardRenderer';
import { loadCardDataFromHash } from '@/lib/cardImport';

/**
 * 无 UI 外壳的纯卡片渲染页。
 *
 * 用途：供无头浏览器截图 / 程序化导出 / 链接预览，在画板逻辑尺寸内渲染单张卡片，
 * 不含编辑器与缩放容器（CardStage 的 transform: scale 不生效），保证截取到的就是
 * 卡片自然尺寸（如 3:4 → 540×720 逻辑像素），配合 deviceScaleFactor 即可出高清图。
 *
 * 数据来源与主页面一致：读取 #card=<base64url> hash 注入。
 */
export default function ExportPage() {
  const [data, setData] = useState<CardData>(INITIAL_CARD_DATA);

  useEffect(() => {
    const fromHash = loadCardDataFromHash();
    if (fromHash) setData(fromHash);
  }, []);

  return <CardRenderer data={data} />;
}
