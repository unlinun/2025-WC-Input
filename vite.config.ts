import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: 'dist', // 輸出目錄
    sourcemap: true,
    lib: {
      entry: 'src/index.ts', // 打包入口
      name: 'CustomInput', // 輸出的全域變數名稱
      fileName: 'custom-input', // 輸出檔案名稱
      formats: ['es', 'umd'], // 支援 ES Module 與 UMD 格式
    },
  },
  plugins: [dts()]
});
