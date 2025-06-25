
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { onosEndpoints } from '../data/onosEndpoints';

interface EndpointsListProps {
  onLoadEndpoint: (endpoint: any) => void;
}

export const EndpointsList: React.FC<EndpointsListProps> = ({ onLoadEndpoint }) => {
  const [parameterDialog, setParameterDialog] = useState<any>(null);
  const [parameters, setParameters] = useState<{ [key: string]: string }>({});

  const extractParameters = (url: string) => {
    const matches = url.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const hasParameters = (url: string) => {
    return url.includes('{') && url.includes('}');
  };

  const handleEndpointClick = (endpoint: any) => {
    if (hasParameters(endpoint.url)) {
      const params = extractParameters(endpoint.url);
      const paramObj: { [key: string]: string } = {};
      params.forEach(param => {
        paramObj[param] = '';
      });
      setParameters(paramObj);
      setParameterDialog(endpoint);
    } else {
      onLoadEndpoint(endpoint);
    }
  };

  const handleParameterSubmit = () => {
    if (!parameterDialog) return;
    
    let finalUrl = parameterDialog.url;
    Object.entries(parameters).forEach(([key, value]) => {
      if (value.trim()) {
        finalUrl = finalUrl.replace(`{${key}}`, value.trim());
      }
    });

    // Vérifier s'il reste des paramètres non remplis
    if (hasParameters(finalUrl)) {
      alert('Veuillez remplir tous les paramètres requis');
      return;
    }

    onLoadEndpoint({
      ...parameterDialog,
      url: finalUrl
    });
    setParameterDialog(null);
    setParameters({});
  };

  const getParameterPlaceholder = (param: string) => {
    const placeholders: { [key: string]: string } = {
      'deviceId': 'of:0000000000000001',
      'hostId': '00:00:00:00:00:01/None',
      'flowId': '1234567890',
      'clusterId': '0',
      'linkId': 'of:0000000000000001/1-of:0000000000000002/1',
      'mac': '00:00:00:00:00:01',
      'vlan': 'None',
      'portNumber': '1',
      'direction': 'INGRESS',
      'connectPoint': 'of:0000000000000001/1',
      'sourceId': 'of:0000000000000001',
      'destinationId': 'of:0000000000000002',
      'groupKey': 'group1',
      'meterId': '1',
      'app-id': 'org.onosproject.fwd',
      'intent-id': '0x1',
      'app-name': 'org.onosproject.fwd',
      'component': 'org.onosproject.net.topology.impl.DefaultTopologyProvider'
    };
    return placeholders[param] || `Valeur pour ${param}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Endpoints ONOS disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(onosEndpoints).map(([category, endpoints]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 capitalize text-blue-600">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="grid gap-2">
                  {endpoints.map((endpoint, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEndpointClick(endpoint)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          endpoint.method === 'GET' ? 'default' : 
                          endpoint.method === 'POST' ? 'secondary' :
                          endpoint.method === 'PUT' ? 'outline' : 'destructive'
                        }>
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm">{endpoint.url}</span>
                        {hasParameters(endpoint.url) && (
                          <Badge variant="outline" className="text-xs">
                            Paramètres requis
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 max-w-md text-right">
                        {endpoint.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!parameterDialog} onOpenChange={() => setParameterDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Remplir les paramètres de l'endpoint</DialogTitle>
          </DialogHeader>
          {parameterDialog && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Endpoint:</p>
                <p className="font-mono text-sm">{parameterDialog.method} {parameterDialog.url}</p>
                <p className="text-xs text-gray-500 mt-1">{parameterDialog.description}</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium">Paramètres requis:</p>
                {extractParameters(parameterDialog.url).map((param) => (
                  <div key={param}>
                    <label className="text-sm font-medium text-gray-700">
                      {param}:
                    </label>
                    <Input
                      placeholder={getParameterPlaceholder(param)}
                      value={parameters[param] || ''}
                      onChange={(e) => setParameters(prev => ({
                        ...prev,
                        [param]: e.target.value
                      }))}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setParameterDialog(null)}>
                  Annuler
                </Button>
                <Button onClick={handleParameterSubmit}>
                  Charger l'endpoint
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
