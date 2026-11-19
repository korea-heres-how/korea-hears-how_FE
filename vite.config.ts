import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 서버에 CORS 설정이 없어서, 개발 중에는 /api 요청을 vite가 대신 서버로 넘겨준다.
    proxy: {
      '/api': {
        target: 'https://korea-heres-how.duckdns.org',
        changeOrigin: true,
      },
    },
  },
})
