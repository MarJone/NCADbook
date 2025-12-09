import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/NCADbook/', // GitHub Pages base path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          // QR code libraries (only loaded when needed)
          'vendor-qr': ['html5-qrcode', 'qrcode.react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase threshold for warning
  },
});
