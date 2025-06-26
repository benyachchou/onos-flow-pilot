
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

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
  const copyAsCurl = () => {
    const config = JSON.parse(localStorage.getItem('onosConfig') || '{}');
    const baseUrl = config.baseUrl || 'http://192.168.94.129:8181/onos/v1';
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
    
    if (config.username && config.password) {
      curl += `\n  -u "${config.username}:${config.password}" \\`;
    }
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      curl += `\n  -d '${body}'`;
    } else {
      curl = curl.slice(0, -2);
    }
    
    navigator.clipboard.writeText(curl);
    toast({
      title: "Commande cURL copiée",
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
