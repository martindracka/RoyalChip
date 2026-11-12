import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Content Security Policy for the production build: the browser may only run our own scripts
// and talk to our Appwrite endpoint. Even if someone managed to inject HTML, a foreign
// <script> would not run and stolen data could not be sent to another server.
function contentSecurityPolicy(env) {
  let appwrite = 'https://*.appwrite.io'
  try {
    appwrite = new URL(env.VITE_APPWRITE_ENDPOINT).origin
  } catch {
    // no endpoint configured – fall back to Appwrite Cloud
  }
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    `connect-src 'self' ${appwrite}`,
    `img-src 'self' data: blob: https://images.unsplash.com ${appwrite}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')

  return {
    name: 'content-security-policy',
    apply: 'build', // the dev server needs inline scripts for hot reload
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' }]
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [vue(), contentSecurityPolicy(loadEnv(mode, process.cwd(), 'VITE_'))],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // game rules shared with the Appwrite Function (functions/casino)
      '@shared': fileURLToPath(new URL('./shared', import.meta.url))
    }
  },
  test: {
    environment: 'node'
  }
}))
