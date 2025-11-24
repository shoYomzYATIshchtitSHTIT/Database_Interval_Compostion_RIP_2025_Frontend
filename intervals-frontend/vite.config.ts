import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false, // Отключаем в продакшене
      },
      manifest: {
        name: "База музыкальных интервалов",
        short_name: "Интервалы",
        start_url: "/Frontend-RIP/", // ВАЖНО: полный путь
        display: "standalone",
        background_color: "#7978F7",
        theme_color: "#7978F7",
        orientation: "portrait-primary",
        icons: [
          { src: "img/image192.png", type: "image/png", sizes: "192x192" }, // убрали ведущий '/'
          { src: "img/image512.png", type: "image/png", sizes: "512x512" }  // убрали ведущий '/'
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: "/Frontend-RIP/",
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})