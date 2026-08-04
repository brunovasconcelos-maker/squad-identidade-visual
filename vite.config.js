import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O GitHub Pages não tem fallback de SPA: uma URL como /logo devolve 404.
// Copiar o index.html para 404.html faz o Pages servir a app mesmo assim,
// e o react-router resolve a rota a partir da URL.
function spaFallback() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const outDir = resolve(process.cwd(), 'dist')
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

// O site é publicado em https://<usuario>.github.io/squad-identidade-visual/
// Em dev o base fica em '/' para o npm run dev continuar simples.
// mode: 'development' no npm run dev, 'production' no build e no preview.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/squad-identidade-visual/' : '/',
  plugins: [react(), spaFallback()],
}))
