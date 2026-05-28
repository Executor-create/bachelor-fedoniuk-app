import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'socket.io-client',
      'react-hook-form',
      // 'react-icons' intentionally omitted — subpath imports handle tree-shaking
      'clsx',
      'tailwind-merge',
    ],
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/@remix-run/')
          ) {
            return 'react-vendor'
          }

          if (
            id.includes('node_modules/react-icons/') ||
            id.includes('node_modules/clsx/') ||
            id.includes('node_modules/tailwind-merge/')
          ) {
            return 'ui-vendor'
          }

          if (id.includes('node_modules/framer-motion/')) {
            return 'animation-vendor'
          }

          if (
            id.includes('node_modules/axios/') ||
            id.includes('node_modules/socket.io-client/') ||
            id.includes('node_modules/localforage/') ||
            id.includes('node_modules/match-sorter/') ||
            id.includes('node_modules/sort-by/') ||
            id.includes('node_modules/react-hook-form/')
          ) {
            return 'utils-vendor'
          }
        },
      },
    },
  },
})
