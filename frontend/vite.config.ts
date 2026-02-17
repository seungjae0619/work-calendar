// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ],

  resolve: {
    alias: {
      // 이 부분이 핵심입니다: "@"를 "./src" 폴더로 매핑
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "https://todayshift.com", // 1. 실제 API 주소
        changeOrigin: true, // 2. 호스트 헤더를 타겟(todayshift)으로 속임 (핵심!)
        rewrite: (path) => path.replace(/^\/api/, ""), // 3. /api를 지우고 요청
        secure: false, // 4. https 인증서 에러 무시
      },
    },
  },
});
