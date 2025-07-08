import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'fastPOS',
        short_name: 'fastPOS',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'fastpos-logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ],
        start_url: '/',
        display: 'standalone'
      }
    })
  ],
  server: {
    port: 8080,
    host: true
  }
})
