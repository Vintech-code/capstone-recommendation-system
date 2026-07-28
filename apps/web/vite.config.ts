import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/sanctum': 'http://localhost:8000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router)[\\/]/,
            },
            {
              name: 'vendor-ui',
              test: /node_modules[\\/](radix-ui|lucide-react|sonner)[\\/]/,
            },
            {
              name: 'vendor-data',
              test: /node_modules[\\/](@tanstack|react-hook-form|zod)[\\/]/,
            },
            {
              name: 'vendor-charts',
              test: /node_modules[\\/](recharts|react-is)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
