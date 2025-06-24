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

  // Endpoints ONOS complets organisés par catégories
  const onosEndpoints = {
    devices: [
      { url: '/devices', method: 'GET', description: 'Lists all infrastructure devices' },
      { url: '/devices/{deviceId}', method: 'GET', description: 'Lists details of a specific device' },
      { url: '/devices/{deviceId}/ports', method: 'GET', description: 'Lists ports of a specific device' },
      { url: '/devices', method: 'POST', description: 'Creates a new infrastructure device' },
      { url: '/devices/{deviceId}', method: 'PUT', description: 'Updates a device' },
      { url: '/devices/{deviceId}', method: 'DELETE', description: 'Deletes a device' }
    ],
    links: [
      { url: '/links', method: 'GET', description: 'Lists all infrastructure links' },
      { url: '/links?device={deviceId}&port={portNumber}&direction={direction}', method: 'GET', description: 'Lists details of a link with filters' },
      { url: '/links', method: 'POST', description: 'Creates a new infrastructure link' },
      { url: '/links/{linkId}', method: 'PUT', description: 'Updates a link' },
      { url: '/links/{linkId}', method: 'DELETE', description: 'Deletes a link' }
    ],
    hosts: [
      { url: '/hosts', method: 'GET', description: 'Lists all end-station hosts' },
      { url: '/hosts/{hostId}', method: 'GET', description: 'Lists details of a specific host by ID' },
      { url: '/hosts/{mac}/{vlan}', method: 'GET', description: 'Lists details of a host by MAC and VLAN' },
      { url: '/hosts', method: 'POST', description: 'Creates a new end-station host' },
      { url: '/hosts/{hostId}', method: 'PUT', description: 'Updates an end-station host' },
      { url: '/hosts/{hostId}', method: 'DELETE', description: 'Deletes an end-station host' }
    ],
    topology: [
      { url: '/topology', method: 'GET', description: 'Gets overview of current topology' },
      { url: '/topology/clusters', method: 'GET', description: 'Gets list of topology clusters' },
      { url: '/topology/clusters/{clusterId}', method: 'GET', description: 'Gets overview of specific cluster' },
      { url: '/topology/clusters/{clusterId}/devices', method: 'GET', description: 'Gets devices in cluster' },
      { url: '/topology/clusters/{clusterId}/links', method: 'GET', description: 'Gets links in cluster' },
      { url: '/topology/broadcast/{connectPoint}', method: 'GET', description: 'Checks if point permits broadcast' },
      { url: '/topology/infrastructure/{connectPoint}', method: 'GET', description: 'Checks if point is infrastructure' }
    ],
    paths: [
      { url: '/paths/{sourceId}/{destinationId}', method: 'GET', description: 'Gets shortest paths between elements' }
    ],
    flows: [
      { url: '/flows', method: 'GET', description: 'Gets all flow rules in the system' },
      { url: '/flows/{deviceId}', method: 'GET', description: 'Gets flow rules for a device' },
      { url: '/flows/{deviceId}/{flowId}', method: 'GET', description: 'Gets details of a specific flow rule' },
      { url: '/flows/{deviceId}', method: 'POST', description: 'Creates a flow rule for a device' },
      { url: '/flows', method: 'POST', description: 'Adds a batch of flow rules' },
      { url: '/flows/{deviceId}/{flowId}', method: 'DELETE', description: 'Deletes a flow rule' },
      { url: '/statistics/flows/link/{linkId}', method: 'GET', description: 'Gets flow statistics for a link' }
    ],
    flowObjectives: [
      { url: '/flowobjectives/{deviceId}/filter', method: 'POST', description: 'Creates filtering objective' },
      { url: '/flowobjectives/{deviceId}/forward', method: 'POST', description: 'Creates forwarding objective' },
      { url: '/flowobjectives/{deviceId}/next', method: 'POST', description: 'Creates next objective' },
      { url: '/flowobjectives/next', method: 'GET', description: 'Gets globally unique nextId' },
      { url: '/flowobjectives/policy', method: 'POST', description: 'Installs filtering rules' }
    ],
    groups: [
      { url: '/groups', method: 'GET', description: 'Gets all group entries in the system' },
      { url: '/groups/{deviceId}', method: 'GET', description: 'Gets group entries for a device' },
      { url: '/groups/{deviceId}/{groupKey}', method: 'GET', description: 'Gets details of a specific group' },
      { url: '/groups/{deviceId}', method: 'POST', description: 'Creates a group entry for a device' },
      { url: '/groups/{deviceId}/{groupKey}', method: 'DELETE', description: 'Deletes a group entry' }
    ],
    meters: [
      { url: '/meters', method: 'GET', description: 'Gets all meter entries in the system' },
      { url: '/meters/{deviceId}', method: 'GET', description: 'Gets meter entries for a device' },
      { url: '/meters/{deviceId}/{meterId}', method: 'GET', description: 'Gets details of a specific meter' },
      { url: '/meters/{deviceId}', method: 'POST', description: 'Creates a meter entry for a device' },
      { url: '/meters/{deviceId}/{meterId}', method: 'DELETE', description: 'Deletes a meter entry' }
    ],
    intents: [
      { url: '/intents', method: 'GET', description: 'Gets all Intent objects in the system' },
      { url: '/intents/{app-id}/{intent-id}', method: 'GET', description: 'Gets details of a specific Intent' },
      { url: '/intents', method: 'POST', description: 'Creates a new Intent object' },
      { url: '/intents/{app-id}/{intent-id}', method: 'DELETE', description: 'Removes an intent from the system' }
    ],
    applications: [
      { url: '/applications', method: 'GET', description: 'Gets list of all installed applications' },
      { url: '/applications/{app-name}', method: 'GET', description: 'Gets info about named application' },
      { url: '/applications', method: 'POST', description: 'Installs application using app.xml or ZIP' },
      { url: '/applications/{app-name}', method: 'DELETE', description: 'Uninstalls the named application' },
      { url: '/applications/{app-name}/active', method: 'POST', description: 'Activates the named application' },
      { url: '/applications/{app-name}/active', method: 'DELETE', description: 'Deactivates the named application' },
      { url: '/applications/ids/entry', method: 'GET', description: 'Gets applicationId entry by id or name' },
      { url: '/applications/ids', method: 'GET', description: 'Gets list of all registered applicationIds' }
    ],
    configuration: [
      { url: '/configuration', method: 'GET', description: 'Gets all components and their configuration' },
      { url: '/configuration/{component}', method: 'GET', description: 'Gets configuration for a component' },
      { url: '/configuration/{component}', method: 'POST', description: 'Adds configuration to a component' },
      { url: '/configuration/{component}', method: 'DELETE', description: 'Removes component configuration' }
    ]
  };

  // Templates JSON étendus
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
    batchFlows: `{
  "flows": [
    {
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
          }
        ]
      }
    }
  ]
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
}`,
    host: `{
  "mac": "00:00:00:00:00:01",
  "vlan": -1,
  "location": {
    "elementId": "of:0000000000000001",
    "port": "1"
  },
  "ipAddresses": ["192.168.1.100"]
}`,
    group: `{
  "type": "ALL",
  "deviceId": "of:0000000000000001",
  "buckets": [
    {
      "treatment": {
        "instructions": [
          {
            "type": "OUTPUT",
            "port": "2"
          }
        ]
      }
    }
  ]
}`,
    meter: `{
  "deviceId": "of:0000000000000001",
  "unit": "KB_PER_SEC",
  "burst": true,
  "bands": [
    {
      "type": "DROP",
      "rate": 1000
    }
  ]
}`,
    filterObjective: `{
  "type": "PERMIT",
  "priority": 40000,
  "conditions": [
    {
      "type": "IN_PORT",
      "port": 1
    }
  ]
}`,
    forwardObjective: `{
  "flag": "SPECIFIC",
  "priority": 40000,
  "selector": {
    "criteria": [
      {
        "type": "ETH_TYPE",
        "ethType": "0x0800"
      }
    ]
  },
  "treatment": {
    "instructions": [
      {
        "type": "OUTPUT",
        "port": "2"
      }
    ]
  }
}`,
    nextObjective: `{
  "type": "SIMPLE",
  "treatments": [
    {
      "instructions": [
        {
          "type": "OUTPUT",
          "port": "2"
        }
      ]
    }
  ]
}`,
    configuration: `{
  "ipv6NeighborDiscovery": "false",
  "hostRemovalEnabled": "true"
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

  const loadEndpoint = (endpoint: any) => {
    setMethod(endpoint.method);
    setUrl(endpoint.url);
    setUrlMode('preset');
    
    // Auto-load appropriate template based on endpoint
    if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
      if (endpoint.url.includes('/flows/') && !endpoint.url.includes('objectives')) {
        setBody(jsonTemplates.flow);
      } else if (endpoint.url === '/flows') {
        setBody(jsonTemplates.batchFlows);
      } else if (endpoint.url.includes('/intents')) {
        setBody(jsonTemplates.intent);
      } else if (endpoint.url.includes('/devices') && endpoint.method === 'POST') {
        setBody(jsonTemplates.device);
      } else if (endpoint.url.includes('/hosts')) {
        setBody(jsonTemplates.host);
      } else if (endpoint.url.includes('/groups')) {
        setBody(jsonTemplates.group);
      } else if (endpoint.url.includes('/meters')) {
        setBody(jsonTemplates.meter);
      } else if (endpoint.url.includes('/filter')) {
        setBody(jsonTemplates.filterObjective);
      } else if (endpoint.url.includes('/forward')) {
        setBody(jsonTemplates.forwardObjective);
      } else if (endpoint.url.includes('/next')) {
        setBody(jsonTemplates.nextObjective);
      } else if (endpoint.url.includes('/configuration')) {
        setBody(jsonTemplates.configuration);
      }
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
        description: "Collection complète d'API pour contrôleur ONOS",
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
      curl = curl.slice(0, -2);
    }
    
    navigator.clipboard.writeText(curl);
    toast({
      title: "Commande cURL copiée",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ONOS API Explorer</h1>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Request Builder</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints ONOS</TabsTrigger>
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
                  
                  {urlMode === 'custom' ? (
                    <Input
                      className="flex-1"
                      placeholder="https://api.example.com/endpoint ou /devices"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                  ) : (
                    <Input
                      className="flex-1"
                      placeholder="/devices ou /flows/{deviceId}"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
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
                        <SelectItem value="flow">Flow Rule</SelectItem>
                        <SelectItem value="batchFlows">Batch Flows</SelectItem>
                        <SelectItem value="intent">Intent</SelectItem>
                        <SelectItem value="device">Device</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="filterObjective">Filter Objective</SelectItem>
                        <SelectItem value="forwardObjective">Forward Objective</SelectItem>
                        <SelectItem value="nextObjective">Next Objective</SelectItem>
                        <SelectItem value="configuration">Configuration</SelectItem>
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

        <TabsContent value="endpoints">
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
                          onClick={() => loadEndpoint(endpoint)}
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
              <CardTitle>Templates JSON pour ONOS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(jsonTemplates).map(([name, template]) => (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</h4>
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
