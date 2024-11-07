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
    testTimeout: 20_000,
    environment: 'happy-dom',
    setupFiles: ['src/tests/setup/mocks/index.ts', 'src/tests/setup/index.ts', 'fake-indexeddb/auto'],
    globals: true,
    globalSetup: ['src/tests/setup/setup-timezone.ts'],
    env: {
      VITE_DISPENSER_AUTH0_DOMAIN: 'test',
      VITE_DISPENSER_AUTH0_CLIENT_ID: 'test',
      VITE_DISPENSER_AUTH0_AUDIENCE: 'test',
      VITE_TESTNET_DISPENSER_API_URL: 'https://test.api',
      VITE_TESTNET_DISPENSER_ADDRESS: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
      // For running tests against LocalNet
      ALGOD_TOKEN: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      ALGOD_SERVER: 'http://localhost',
      ALGOD_PORT: '4001',
      KMD_PORT: '4002',
      INDEXER_TOKEN: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      INDEXER_SERVER: 'http://localhost',
      INDEXER_PORT: '8980',
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
      ignored: ['**/src-tauri/**', '**/*.test.tsx'],
    },
  },

  // Settings for shadcn
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
