import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
declare const process: { env: Record<string, string | undefined> }
export default defineConfig({
  publicDir: false,
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    manifest: { name: 'GroceryOS', short_name: 'GroceryOS', description: 'Operating system for independent grocery stores',
      theme_color: '#0f1b33', background_color: '#f6f8fa', display: 'standalone',
      icons: [{ src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%230f1b33'/%3E%3Ccircle cx='256' cy='256' r='110' fill='%2322c55e'/%3E%3C/svg%3E", sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] } })],
})
