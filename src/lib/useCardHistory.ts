import { useCallback, useReducer, useRef, useState } from 'react';

function jsonEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export interface CardHistory<T> {
  present: T;
  /** 更新当前值；连续编辑会被 debounce 合并为一条历史，immediate 则立即落栈 */
  set: (updater: T | ((prev: T) => T), options?: { immediate?: boolean }) => void;
  /** 直接替换当前值并清空全部历史（用于初始化加载、重置） */
  replace: (value: T) => void;
  undo: () => void;
  redo: () => void;
  flush: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * 带 debounce 快照合并的撤销 / 重做历史栈。
 *
 * 设计要点：
 * - 文本输入等高频连续编辑只在停顿后落一条快照，避免历史栈被逐字符撑爆；
 * - `immediate` 模式（切换模板 / 比例 / 预设 / 重置等结构性变化）立即落栈；
 * - past / future 用 ref 维护，配合 forceRender 触发渲染，避免在 state updater
 *   内嵌套 setState（React 18 StrictMode 下 updater 会被双调用的副作用隐患）。
 */
export function useCardHistory<T>(initial: T, debounceMs = 600): CardHistory<T> {
  const [present, setPresent] = useState<T>(initial);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const presentRef = useRef<T>(initial);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const draftBaseRef = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const base = draftBaseRef.current;
    if (base === null) return;
    draftBaseRef.current = null;
    if (!jsonEqual(base, presentRef.current)) {
      pastRef.current = [...pastRef.current, base];
      futureRef.current = [];
      forceRender();
    }
  }, []);

  const set = useCallback(
    (updater: T | ((prev: T) => T), options?: { immediate?: boolean }) => {
      const prev = presentRef.current;
      const next =
        typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      presentRef.current = next;

      if (options?.immediate) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        const base = draftBaseRef.current ?? prev;
        draftBaseRef.current = null;
        if (!jsonEqual(base, next)) {
          pastRef.current = [...pastRef.current, base];
          futureRef.current = [];
          forceRender();
        }
      } else {
        if (draftBaseRef.current === null) {
          draftBaseRef.current = prev;
        }
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(flush, debounceMs);
      }
      setPresent(next);
    },
    [debounceMs, flush]
  );

  const replace = useCallback((value: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    draftBaseRef.current = null;
    pastRef.current = [];
    futureRef.current = [];
    presentRef.current = value;
    setPresent(value);
    forceRender();
  }, []);

  const undo = useCallback(() => {
    flush();
    const past = pastRef.current;
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    futureRef.current = [presentRef.current, ...futureRef.current];
    pastRef.current = past.slice(0, -1);
    draftBaseRef.current = null;
    presentRef.current = prev;
    setPresent(prev);
    forceRender();
  }, [flush]);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;
    const next = future[0];
    pastRef.current = [...pastRef.current, presentRef.current];
    futureRef.current = future.slice(1);
    draftBaseRef.current = null;
    presentRef.current = next;
    setPresent(next);
    forceRender();
  }, []);

  return {
    present,
    set,
    replace,
    undo,
    redo,
    flush,
    canUndo: pastRef.current.length > 0 || draftBaseRef.current !== null,
    canRedo: futureRef.current.length > 0,
  };
}
