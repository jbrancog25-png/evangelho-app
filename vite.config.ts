import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Qual build está no ar — a tela /diagnostico mostra. Responde de cara
  // "o deploy novo já chegou?".
  define: {
    __VERSAO__: JSON.stringify(
      `${(process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7) || 'local'} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    ),
  },
})
