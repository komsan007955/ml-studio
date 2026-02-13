import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      // Route MLflow tracking requests to the mlflow_serve container
      '/api/2.0/mlflow': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
      // Route custom backend requests to the ml_studio container
      '/api/v1/studio': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        // If your backend doesn't use the /api/v1 prefix, rewrite it:
        // rewrite: (path) => path.replace(/^\/api\/v1\/studio/, '')
      },
    },
  },
})