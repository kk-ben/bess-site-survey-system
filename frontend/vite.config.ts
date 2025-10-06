import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // 本番ビルド最適化
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.logを削除
        drop_debugger: true
      }
    },
    // チャンク分割戦略（オプション - 依存関係がインストールされている場合のみ有効）
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       'react-vendor': ['react', 'react-dom', 'react-router-dom'],
    //       'ui-vendor': ['zustand', '@headlessui/react'],
    //       'map-vendor': ['leaflet', 'react-leaflet'],
    //       'chart-vendor': ['recharts']
    //     }
    //   }
    // },
    // チャンクサイズ警告の閾値を上げる
    chunkSizeWarningLimit: 1000,
    // ソースマップは本番では無効化（サイズ削減）
    sourcemap: false
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // 依存関係の事前バンドル最適化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand'
    ]
  }
});
