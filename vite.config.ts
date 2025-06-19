import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // PROXY DESHABILITADO: Interfiere con las llamadas al backend
    // proxy: {
    //   '/api': {
    //     target: 'https://sandbox.wompi.co/v1',
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production for performance
    minify: 'esbuild', // Usar esbuild en lugar de terser (viene incluido)
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom']
          // Eliminar axios chunk ya que genera chunk vacío
        },
      },
    },
    // Amplify optimizations
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  // Environment variable handling for Amplify
  envPrefix: 'VITE_',
  // Production optimizations con esbuild
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})

