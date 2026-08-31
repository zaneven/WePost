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

/**
 * 多卡堆叠布局下的溢出检测：任一张卡片正文溢出画板（被裁切）即返回 true。
 * 卡片根元素由 CardRenderer 挂 data-wepost-card 标识。
 *
 * @param cardCount 当前卡片总数（变化时重新挂载观察器）
 * @param dependency 触发重新测量的依赖（通常为 cardData）
 */
export function useCardsOverflow(cardCount: number, dependency: unknown): boolean {
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const els = document.querySelectorAll<HTMLElement>('[data-wepost-card]');
      if (!els.length) return;
      // +1 容差吸收亚像素与浏览器舍入
      const next = Array.from(els).some(
        (el) => el.scrollHeight > el.clientHeight + 1
      );
      setOverflowing(next);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();

    const els = Array.from(document.querySelectorAll('[data-wepost-card]'));
    const ro = new ResizeObserver(schedule);
    const mo = new MutationObserver(schedule);
    els.forEach((el) => {
      ro.observe(el);
      // 内容 / 排版重排（字体、图片加载等）也会改变内容高度
      mo.observe(el, { subtree: true, childList: true, characterData: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, [cardCount, dependency]);

  return overflowing;
}
