import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Node.js polyfills
      stream: 'stream-browserify',
      crypto: resolve(__dirname, 'src/utils/cryptoPolyfill.js'),
      process: 'process/browser',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'buffer',
    }
  },
  define: {
    'process.env': {},
    'process.browser': true,
    'process.version': JSON.stringify('16.0.0'),
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    }
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          solana: ['@solana/web3.js'],
          spl: ['@solana/spl-token']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  }
});