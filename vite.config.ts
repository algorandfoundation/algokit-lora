/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/tests/setup/clean-up-dom.ts', 'src/tests/setup/mocks/index.ts', 'fake-indexeddb/auto'],
    globals: true,
    globalSetup: ['src/tests/setup/setup-timezone.ts'],
    env: {
      VITE_DISPENSER_AUTH0_DOMAIN: 'test',
      VITE_DISPENSER_AUTH0_CLIENT_ID: 'test',
      VITE_DISPENSER_AUTH0_AUDIENCE: 'test',
      VITE_TESTNET_DISPENSER_API_URL: 'https://test.api',
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },

  // Settings for shadcb
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
