import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use environment variable or default IP
  const controllerIp = process.env.VITE_ONOS_IP || '192.168.94.129';
  const controllerPort = process.env.VITE_ONOS_PORT || '8181';
  
  console.log(`Configuring proxy to ONOS controller at ${controllerIp}:${controllerPort}`);
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/onos/v1': {
          target: `http://${controllerIp}:${controllerPort}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/onos\/v1/, '/onos/v1'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.method, req.url, 'to', options.target + proxyReq.path);
              // Ensure proper headers for ONOS
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Proxy response:', proxyRes.statusCode, req.url);
              if (proxyRes.statusCode === 401 || proxyRes.statusCode === 403) {
                console.log('Authentication failed - check ONOS credentials');
              }
            });
          }
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
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