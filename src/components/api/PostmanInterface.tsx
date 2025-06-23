import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Plus, Download, Save, Copy, Trash2, Clock, FileText, Search } from 'lucide-react';
import { onosApi } from '@/services/onosApi';
import { useToast } from '@/hooks/use-toast';

interface ApiRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp?: number;
}

interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  responseTime: number;
  size: number;
}

export const PostmanInterface = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('/devices');
  const [customUrl, setCustomUrl] = useState('');
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState<ApiRequest[]>([]);
  const [activeTab, setActiveTab] = useState('builder');
  const [urlMode, setUrlMode] = useState<'preset' | 'custom'>('preset');
  const { toast } = useToast();

  // Endpoints ONOS prédéfinis avec catégories
  const onosEndpoints = {
    devices: [
      '/devices',
      '/devices/{deviceId}',
      '/devices/{deviceId}/ports'
    ],
    switches: [
      '/devices', // Les switches sont des devices de type switch
      '/flows',
      '/flows/{deviceId}'
    ],
    hosts: [
      '/hosts',
      '/hosts/{hostId}'
    ],
    links: [
      '/links',
      '/links/{linkId}'
    ],
    topology: [
      '/topology',
      '/topology/clusters'
    ],
    flows: [
      '/flows',
      '/flows/{deviceId}',
      '/flows/{deviceId}/{flowId}'
    ],
    apps: [
      '/applications',
      '/applications/{appId}'
    ],
    intents: [
      '/intents',
      '/intents/{intentId}'
    ]
  };

  // Templates JSON prédéfinis
  const jsonTemplates = {
    flow: `{
  "priority": 40000,
  "timeout": 0,
  "isPermanent": true,
  "deviceId": "of:0000000000000001",
  "treatment": {
    "instructions": [
      {
        "type": "OUTPUT",
        "port": "2"
      }
    ]
  },
  "selector": {
    "criteria": [
      {
        "type": "IN_PORT",
        "port": "1"
      },
      {
        "type": "ETH_TYPE",
        "ethType": "0x0800"
      }
    ]
  }
}`,
    intent: `{
  "type": "HostToHostIntent",
  "appId": "org.onosproject.cli",
  "one": "00:00:00:00:00:01/-1",
  "two": "00:00:00:00:00:02/-1"
}`,
    device: `{
  "type": "SWITCH",
  "manufacturer": "Open vSwitch",
  "hwVersion": "2.5.0",
  "swVersion": "2.5.0",
  "serialNumber": "1"
}`
  };

  useEffect(() => {
    const saved = localStorage.getItem('onosApiRequests');
    if (saved) {
      setSavedRequests(JSON.parse(saved));
    }
  }, []);

  const executeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const requestUrl = urlMode === 'custom' ? customUrl : url;
      
      let fullUrl = requestUrl;
      if (!requestUrl.startsWith('http')) {
        const config = JSON.parse(localStorage.getItem('onosConfig') || '{}');
        const baseUrl = config.baseUrl || 'http://192.168.94.129:8181/onos/v1';
        fullUrl = `${baseUrl}${requestUrl}`;
      }

      let requestBody;
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch (e) {
          throw new Error('Corps JSON invalide');
        }
      }

      const result = await onosApi.executeRequest(method, requestUrl, requestBody);
      
      const responseTime = Date.now() - startTime;
      const responseSize = JSON.stringify(result.data).length;

      setResponse({
        status: result.status || (result.success ? 200 : 500),
        statusText: result.success ? 'OK' : 'Error',
        data: result.data || result.error,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': responseSize.toString()
        },
        responseTime,
        size: responseSize
      });

      if (result.success) {
        toast({
          title: "Requête réussie",
          description: `${method} ${requestUrl} - ${responseTime}ms`,
        });
      } else {
        toast({
          title: "Erreur de requête",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setResponse({
        status: 500,
        statusText: 'Error',
        data: { error: error.message },
        headers: {},
        responseTime: Date.now() - startTime,
        size: 0
      });
      
      toast({
        title: "Erreur de requête",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = () => {
    const requestUrl = urlMode === 'custom' ? customUrl : url;
    const newRequest: ApiRequest = {
      id: Date.now().toString(),
      name: `${method} ${requestUrl}`,
      method,
      url: requestUrl,
      headers,
      body,
      timestamp: Date.now()
    };

    const updated = [...savedRequests, newRequest];
    setSavedRequests(updated);
    localStorage.setItem('onosApiRequests', JSON.stringify(updated));
    
    toast({
      title: "Requête sauvegardée",
      description: `${method} ${requestUrl}`,
    });
  };

  const loadRequest = (request: ApiRequest) => {
    setMethod(request.method);
    if (request.url.includes('http')) {
      setCustomUrl(request.url);
      setUrlMode('custom');
    } else {
      setUrl(request.url);
      setUrlMode('preset');
    }
    setHeaders(request.headers);
    setBody(request.body);
    setActiveTab('builder');
  };

  const deleteRequest = (id: string) => {
    const updated = savedRequests.filter(r => r.id !== id);
    setSavedRequests(updated);
    localStorage.setItem('onosApiRequests', JSON.stringify(updated));
    
    toast({
      title: "Requête supprimée",
    });
  };

  const loadJsonTemplate = (template: string) => {
    setBody(jsonTemplates[template as keyof typeof jsonTemplates]);
  };

  const exportCollection = () => {
    const collection = {
      info: {
        name: "ONOS API Collection",
        description: "Collection d'API pour contrôleur ONOS",
        version: "1.0.0"
      },
      requests: savedRequests
    };
    
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onos-api-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAsCurl = () => {
    const config = JSON.parse(localStorage.getItem('onosConfig') || '{}');
    const baseUrl = config.baseUrl || 'http://192.168.94.129:8181/onos/v1';
    const fullUrl = urlMode === 'custom' ? customUrl : url;
    const completeUrl = fullUrl.startsWith('http') ? fullUrl : `${baseUrl}${fullUrl}`;
    
    let curl = `curl -X ${method} "${completeUrl}" \\`;
    
    Object.entries(headers).forEach(([key, value]) => {
      curl += `\n  -H "${key}: ${value}" \\`;
    });
    
    if (config.username && config.password) {
      curl += `\n  -u "${config.username}:${config.password}" \\`;
    }
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      curl += `\n  -d '${body}'`;
    } else {
      curl = curl.slice(0, -2); // Remove trailing backslash
    }
    
    navigator.clipboard.writeText(curl);
    toast({
      title: "Commande cURL copiée",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">API Explorer</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCollection}>
            <Download className="mr-2 h-4 w-4" />
            Exporter Collection
          </Button>
          <Button onClick={saveRequest}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Request Builder</TabsTrigger>
          <TabsTrigger value="collection">Collection ({savedRequests.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Construire une requête</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2 flex-1">
                  <Select value={urlMode} onValueChange={(value: 'preset' | 'custom') => setUrlMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preset">Preset</SelectItem>
                      <SelectItem value="custom">Custom URL</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {urlMode === 'preset' ? (
                    <Select value={url} onValueChange={setUrl}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sélectionner un endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(onosEndpoints).map(([category, endpoints]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                              {category}
                            </div>
                            {endpoints.map(endpoint => (
                              <SelectItem key={endpoint} value={endpoint}>{endpoint}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="flex-1"
                      placeholder="https://api.example.com/endpoint ou /devices"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                  )}
                </div>
                
                <Button onClick={executeRequest} disabled={loading} className="min-w-24">
                  <Play className="mr-2 h-4 w-4" />
                  {loading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAsCurl}>
                  <Copy className="mr-2 h-4 w-4" />
                  cURL
                </Button>
              </div>

              {(['POST', 'PUT', 'PATCH'].includes(method)) && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Corps de la requête (JSON)</label>
                    <Select onValueChange={loadJsonTemplate}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Charger un template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flow">Flow Template</SelectItem>
                        <SelectItem value="intent">Intent Template</SelectItem>
                        <SelectItem value="device">Device Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder='{"priority": 40000, "deviceId": "of:0000000000000001"}'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    className="font-mono"
                  />
                </div>
              )}

              {response && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Réponse</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {response.responseTime}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {response.size} bytes
                      </span>
                      <Badge variant={response.status < 400 ? 'default' : 'destructive'}>
                        {response.status} {response.statusText}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm overflow-auto max-h-96">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection">
          <Card>
            <CardHeader>
              <CardTitle>Collection sauvegardée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{request.method}</Badge>
                      <span className="font-mono text-sm">{request.url}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.timestamp || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => loadRequest(request)}>
                        Charger
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteRequest(request.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {savedRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune requête sauvegardée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(jsonTemplates).map(([name, template]) => (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold capitalize">{name} Template</h4>
                    <Button 
                      size="sm" 
                      onClick={() => loadJsonTemplate(name)}
                    >
                      Utiliser
                    </Button>
                  </div>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-48">
                    {template}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
