import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // 使用 jsdom 模擬瀏覽器環境（在 Node.js 裡面提供類似瀏覽器的 DOM API）
    globals: true, // 啟用全域測試 API（如 describe、it）
    setupFiles: './test/vitest.setup.ts', // 測試前的初始化檔案
  },
});