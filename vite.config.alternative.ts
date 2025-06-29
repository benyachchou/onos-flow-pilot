// MÉTHODE 7: Configuration Vite alternative avec proxy amélioré
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const controllerIp = process.env.VITE_ONOS_IP || '192.168.94.129';
  const controllerPort = process.env.VITE_ONOS_PORT || '8181';
  
  console.log(`Alternative proxy config for ONOS at ${controllerIp}:${controllerPort}`);
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // MÉTHODE 7A: Proxy avec authentification pré-configurée
        '/onos/v1': {
          target: `http://${controllerIp}:${controllerPort}`,
          changeOrigin: true,
          secure: false,
          timeout: 30000,
          // Ajouter l'authentification directement dans le proxy
          auth: 'onos:rocks',
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Force l'authentification Basic
              const auth = Buffer.from('onos:rocks').toString('base64');
              proxyReq.setHeader('Authorization', `Basic ${auth}`);
              
              // Headers supplémentaires pour ONOS
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('User-Agent', 'ONOS-Flow-Pilot/1.0');
              
              console.log('Proxy request with forced auth:', {
                method: req.method,
                url: req.url,
                target: options.target + proxyReq.path,
                hasAuth: !!proxyReq.getHeader('Authorization')
              });
            });

            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Proxy response:', {
                status: proxyRes.statusCode,
                url: req.url,
                headers: proxyRes.headers
              });

              // Ajouter les headers CORS
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            });

            proxy.on('error', (err, req, res) => {
              console.error('Alternative proxy error:', err);
              if (!res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'ONOS Connection Failed',
                  message: err.message,
                  suggestion: 'Check if ONOS controller is running and accessible'
                }));
              }
            });
          }
        },

        // MÉTHODE 7B: Proxy de fallback pour tests directs
        '/onos-direct': {
          target: `http://${controllerIp}:${controllerPort}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/onos-direct/, '/onos/v1'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Pas d'authentification automatique pour tester
              console.log('Direct proxy request (no auto-auth):', req.url);
            });
          }
        }
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        external: mode === 'development' ? [] : ['vis-data'],
      },
    },
    optimizeDeps: {
      include: ['vis-network', 'vis-data']
    }
  };
});