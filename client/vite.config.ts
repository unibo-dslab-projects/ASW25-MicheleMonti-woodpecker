import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this server configuration:
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // Your Express backend server
        changeOrigin: true,
      }
    }
  }
})