import '@testing-library/jest-dom/vitest';

// Node 22 引入了未配置的全局 localStorage，在 jsdom 环境下需要安全的内存实现
const memoryStore = new Map<string, string>();
const localStorageMock: Storage = {
  getItem: (key: string) => memoryStore.get(String(key)) ?? null,
  setItem: (key: string, value: string) => {
    memoryStore.set(String(key), String(value));
  },
  removeItem: (key: string) => {
    memoryStore.delete(String(key));
  },
  clear: () => {
    memoryStore.clear();
  },
  key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
  get length() {
    return memoryStore.size;
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
