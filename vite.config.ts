import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Dev-only stand-in for the api/fingrid.ts Vercel function. `vite dev`
// never executes files under api/, so without this /playground's live
// chart would only ever work after deploying. Shares the exact fetch
// logic with the real function (api/_fingrid-data.ts) rather than
// reimplementing it, so local dev and production can't drift apart.
function fingridDevMiddleware(apiKey: string | undefined): Plugin {
  return {
    name: 'fingrid-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/fingrid', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (!apiKey) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'FINGRID_API_KEY is not configured on the server' }))
          return
        }
        try {
          const { getFingridSnapshot } = await import('./api/_fingrid-data')
          const snapshot = await getFingridSnapshot(apiKey)
          res.statusCode = 200
          res.end(JSON.stringify(snapshot))
        } catch (err) {
          res.statusCode = 502
          res.end(
            JSON.stringify({
              error: 'Failed to fetch Fingrid data',
              detail: err instanceof Error ? err.message : String(err),
            }),
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Third argument '' (rather than the default 'VITE_' prefix) so this also
  // picks up FINGRID_API_KEY from .env, which is deliberately unprefixed
  // since it's a server-only secret that must never reach the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      fingridDevMiddleware(env.FINGRID_API_KEY),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
