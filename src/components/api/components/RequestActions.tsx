
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useSQLite } from '@/hooks/useSQLite';

interface RequestActionsProps {
  method: string;
  url: string;
  customUrl: string;
  urlMode: 'preset' | 'custom';
  body: string;
  toast: any;
}

export const RequestActions: React.FC<RequestActionsProps> = ({
  method,
  url,
  customUrl,
  urlMode,
  body,
  toast
}) => {
  const [onosConfig, setOnosConfig] = useState({
    ip: '192.168.94.129',
    port: '8181',
    username: 'onos',
    password: 'rocks'
  });

  const { isInitialized, getLatestOnosConfig } = useSQLite();

  useEffect(() => {
    const loadConfig = async () => {
      if (isInitialized) {
        const config = await getLatestOnosConfig();
        if (config) {
          setOnosConfig({
            ip: config.ip,
            port: config.port,
            username: config.username,
            password: config.password
          });
        }
      } else {
        // Fallback vers localStorage
        const stored = localStorage.getItem('onosConfig');
        if (stored) {
          const config = JSON.parse(stored);
          setOnosConfig({
            ip: config.ip || '192.168.94.129',
            port: config.port || '8181',
            username: config.username || 'onos',
            password: config.password || 'rocks'
          });
        }
      }
    };

    loadConfig();

    // Écouter les changements de configuration
    const handleConfigChange = () => {
      loadConfig();
    };

    window.addEventListener('onosConfigChanged', handleConfigChange);
    return () => window.removeEventListener('onosConfigChanged', handleConfigChange);
  }, [isInitialized, getLatestOnosConfig]);

  const copyAsCurl = () => {
    const baseUrl = `http://${onosConfig.ip}:${onosConfig.port}/onos/v1`;
    const fullUrl = urlMode === 'custom' ? customUrl : url;
    const completeUrl = fullUrl.startsWith('http') ? fullUrl : `${baseUrl}${fullUrl}`;
    
    let curl = `curl -X ${method} "${completeUrl}" \\`;
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    Object.entries(headers).forEach(([key, value]) => {
      curl += `\n  -H "${key}: ${value}" \\`;
    });
    
    if (onosConfig.username && onosConfig.password) {
      curl += `\n  -u "${onosConfig.username}:${onosConfig.password}" \\`;
    }
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      curl += `\n  -d '${body}'`;
    } else {
      curl = curl.slice(0, -2);
    }
    
    navigator.clipboard.writeText(curl);
    toast({
      title: "Commande cURL copiée",
      description: `Avec IP: ${onosConfig.ip}:${onosConfig.port}`,
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={copyAsCurl}>
        <Copy className="mr-2 h-4 w-4" />
        cURL
      </Button>
    </div>
  );
};
