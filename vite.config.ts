
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Function to get ONOS config from localStorage or use default
const getOnosConfig = () => {
  try {
    // In server context, we can't access localStorage, so use default
    if (typeof window === 'undefined') {
      return {
        ip: '192.168.94.129',
        port: '8181'
      };
    }
    
    const stored = localStorage.getItem('onosConfig');
    if (stored) {
      const config = JSON.parse(stored);
      return {
        ip: config.ip || '192.168.94.129',
        port: config.port || '8181'
      };
    }
  } catch (error) {
    console.warn('Error reading ONOS config:', error);
  }
  
  return {
    ip: '192.168.94.129',
    port: '8181'
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const onosConfig = getOnosConfig();
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/onos/v1': {
          target: `http://${onosConfig.ip}:${onosConfig.port}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/onos\/v1/, '/onos/v1'),
          configure: (proxy, options) => {
            // Listen for runtime config changes
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Check if config has changed and update target if needed
              const currentConfig = getOnosConfig();
              const currentTarget = `http://${currentConfig.ip}:${currentConfig.port}`;
              if (options.target !== currentTarget) {
                console.log(`Updating proxy target from ${options.target} to ${currentTarget}`);
                options.target = currentTarget;
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
