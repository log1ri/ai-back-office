import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // ใช้ port ปัจจุบันที่รันอยู่
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0', // รองรับ production/deploy แบบ listen ทุก interface
      '.ngrok-free.app', // wildcard สำหรับทุก subdomain ของ ngrok-free.app
      '*', // อนุญาตทุก host (production จริงควรระวังเรื่อง security)
      // เพิ่ม host อื่นๆ ที่ต้องการอนุญาตได้ที่นี่
    ],
    proxy: {
      // ปรับ target ให้ตรงกับ backend ของคุณ
      '/api': {
        target: 'http://localhost:5167',
        changeOrigin: true,
        // ไม่ต้อง rewrite เพราะ backend มี global prefix /api/v1
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
})