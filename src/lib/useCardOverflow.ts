import { useEffect, useState } from 'react';

/**
 * 检测卡片内容是否超出画板（被 overflow-hidden 裁切）。
 *
 * 原理：卡片根容器固定宽高且 overflow-hidden，但 scrollHeight 仍反映
 * 完整内容高度。当 scrollHeight > clientHeight 即代表内容溢出。
 * transform: scale() 不影响布局盒测量，故任意缩放下均有效。
 *
 * @param targetId 卡片根元素 id
 * @param dependency 触发重新测量的依赖（通常为 cardData）
 */
export function useCardOverflow(targetId: string, dependency: unknown): boolean {
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      // +1 容差吸收亚像素与浏览器舍入
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    const el = document.getElementById(targetId);
    if (!el) return;

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // 内容/排版重排（字体、对齐等变化）也会改变高度
    const mo = new MutationObserver(measure);
    mo.observe(el, { subtree: true, childList: true, characterData: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, dependency]);

  return overflowing;
}
