import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, // Prevent jumping to 5174, ensures consistency
    hmr: {
      clientPort: 5173, // Fixes HMR lag on some network configurations
    },
    watch: {
      usePolling: true,
      interval: 1000,
    }
  }
})
