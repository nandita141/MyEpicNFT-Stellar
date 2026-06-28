/* global __dirname */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import commonjs from 'vite-plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs({
      include: ['soroban-client', '@stellar/stellar-sdk/**'],
    }),
  ],
  resolve: {
    alias: {
      '@stellar_card': path.resolve(__dirname, '../packages/stellar_card/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['@stellar/stellar-sdk', '@soroban-react/core', 'tslib'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          stellar: ['@stellar/stellar-sdk', '@stellar/freighter-api'],
          soroban: ['@soroban-react/core', '@soroban-react/freighter'],
        },
      },
    },
    commonjsOptions: {
      include: [/soroban-client/, /tslib/, /node_modules/, /@stellar\/stellar-sdk/],
      transformMixedEsModules: true,
      defaultIsModuleExports: true,
      strictRequires: false,
    },
  },
  // ── Vitest configuration ──────────────────────────────────────────────────
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/tests/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/tests/**', 'src/main.jsx'],
    },
  },
})

