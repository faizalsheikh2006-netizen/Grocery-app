import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
declare const process: { env: Record<string, string | undefined> }
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: { name: 'GroceryOS', short_name: 'GroceryOS', description: 'Operating system for independent grocery stores',
      theme_color: '#0f1b33', background_color: '#f6f8fa', display: 'standalone',
      icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] } })],
})
