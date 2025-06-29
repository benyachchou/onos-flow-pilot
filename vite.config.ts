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
          timeout: 30000, // Increase timeout to 30 seconds
          rewrite: (path) => path.replace(/^\/onos\/v1/, '/onos/v1'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err.message);
              console.error('Error code:', err.code);
              console.error('Target:', options.target);
              
              // Handle specific error types
              if (err.code === 'ECONNRESET') {
                console.error('Connection was reset by the ONOS controller');
                console.error('This usually means:');
                console.error('1. ONOS controller is not running');
                console.error('2. Wrong IP address or port');
                console.error('3. Network connectivity issues');
                console.error('4. Authentication rejected by ONOS');
              } else if (err.code === 'ECONNREFUSED') {
                console.error('Connection refused - ONOS controller may not be running');
              } else if (err.code === 'ETIMEDOUT') {
                console.error('Connection timed out - check network connectivity');
              }
              
              // Send a proper error response
              if (!res.headersSent) {
                res.writeHead(503, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE',
                  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                });
                res.end(JSON.stringify({
                  error: 'ONOS Controller Connection Failed',
                  message: err.code === 'ECONNRESET' ? 
                    'Connection reset by ONOS controller. Check if ONOS is running and credentials are correct.' :
                    err.code === 'ECONNREFUSED' ?
                    'Connection refused. ONOS controller may not be running.' :
                    err.code === 'ETIMEDOUT' ?
                    'Connection timed out. Check network connectivity.' :
                    `Network error: ${err.message}`,
                  code: err.code,
                  target: options.target
                }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.method, req.url, 'to', options.target + proxyReq.path);
              
              // Forward the Authorization header - this is crucial for ONOS authentication
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
              
              // Set proper headers for ONOS
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');
              
              // Add connection keep-alive to prevent socket hang ups
              proxyReq.setHeader('Connection', 'keep-alive');
              proxyReq.setHeader('Keep-Alive', 'timeout=30, max=100');
              
              // Set a reasonable timeout
              proxyReq.setTimeout(25000, () => {
                console.error('Proxy request timeout for:', req.url);
                proxyReq.destroy();
              });
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Proxy response:', proxyRes.statusCode, req.url);
              
              if (proxyRes.statusCode === 401 || proxyRes.statusCode === 403) {
                console.error('Authentication failed - check ONOS credentials (should be onos/rocks)');
              } else if (proxyRes.statusCode >= 500) {
                console.error('ONOS server error:', proxyRes.statusCode, proxyRes.statusMessage);
              }
              
              // Add CORS headers to all responses
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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