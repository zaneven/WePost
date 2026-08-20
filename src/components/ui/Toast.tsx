'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  /** 弹出一条提示，默认 3 秒后自动消失 */
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * 获取 Toast 调用句柄。若未挂载 Provider 则返回 no-op 兜底，
 * 避免在 Provider 外使用时抛错。
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { show: () => undefined };
  }
  return ctx;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />,
  info: <Info className="w-4 h-4 text-blue-500" aria-hidden="true" />,
};

const ACCENT: Record<ToastType, string> = {
  success: 'border-emerald-200',
  error: 'border-red-200',
  info: 'border-blue-200',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast 容器：右下角堆叠，移动端全宽 */}
      <div
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-80"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 bg-white border ${ACCENT[t.type]} shadow-lg rounded-xl px-3.5 py-3 text-sm text-neutral-800 animate-in`}
          >
            <span className="flex-shrink-0 mt-0.5">{ICONS[t.type]}</span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="关闭提示"
              className="flex-shrink-0 -mr-1 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
