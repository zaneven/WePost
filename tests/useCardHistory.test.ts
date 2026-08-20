import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardHistory } from '@/lib/useCardHistory';

// 使用 fake timers 以便精确控制 debounce 快照合并时机
beforeEach(() => {
  vi.useFakeTimers();
});

describe('useCardHistory', () => {
  it('初始 present 即传入值，无可撤销', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));
    expect(result.current.present).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('set 后停顿落栈，可撤销回到起点', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));

    act(() => {
      result.current.set(1);
    });
    // debounce 期间 present 已更新，且 draftBase 已设 -> 可撤销
    expect(result.current.present).toBe(1);
    expect(result.current.canUndo).toBe(true);

    // 触发 debounce 落栈
    act(() => {
      vi.advanceTimersByTime(600);
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.present).toBe(0);
    expect(result.current.canRedo).toBe(true);
  });

  it('连续 set 在停顿前合并为一条历史', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));

    act(() => {
      result.current.set(1);
      result.current.set(2);
      result.current.set(3);
    });
    expect(result.current.present).toBe(3);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    act(() => {
      result.current.undo();
    });
    // 一次撤销直接回到起点 0，证明三次连续编辑合并为一条
    expect(result.current.present).toBe(0);

    act(() => {
      result.current.redo();
    });
    expect(result.current.present).toBe(3);
  });

  it('immediate 模式立即落栈', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));

    act(() => {
      result.current.set(1, { immediate: true });
    });
    act(() => {
      result.current.set(2, { immediate: true });
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.present).toBe(1);

    act(() => {
      result.current.undo();
    });
    expect(result.current.present).toBe(0);
  });

  it('replace 清空全部历史', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));

    act(() => {
      result.current.set(1, { immediate: true });
    });
    act(() => {
      result.current.replace(99);
    });

    expect(result.current.present).toBe(99);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('undo/redo 在边界不抛错', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));

    act(() => {
      result.current.undo(); // 无历史，应安全 no-op
    });
    expect(result.current.present).toBe(0);

    act(() => {
      result.current.redo();
    });
    expect(result.current.present).toBe(0);
  });

  it('新编辑在撤销后清空重做栈', () => {
    const { result } = renderHook(() => useCardHistory<number>(0));

    act(() => {
      result.current.set(1, { immediate: true });
    });
    act(() => {
      result.current.set(2, { immediate: true });
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.set(5, { immediate: true });
    });
    expect(result.current.canRedo).toBe(false);
  });
});
