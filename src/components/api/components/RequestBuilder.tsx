
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, Clock, FileText } from 'lucide-react';
import { onosApi } from '@/services/onosApi';
import { ApiResponse } from '../hooks/useApiRequests';
import { jsonTemplates } from '../data/jsonTemplates';

interface RequestBuilderProps {
  method: string;
  setMethod: (method: string) => void;
  url: string;
  setUrl: (url: string) => void;
  customUrl: string;
  setCustomUrl: (url: string) => void;
  urlMode: 'preset' | 'custom';
  setUrlMode: (mode: 'preset' | 'custom') => void;
  body: string;
  setBody: (body: string) => void;
  response: ApiResponse | null;
  setResponse: (response: ApiResponse | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  toast: any;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = ({
  method, setMethod,
  url, setUrl,
  customUrl, setCustomUrl,
  urlMode, setUrlMode,
  body, setBody,
  response, setResponse,
  loading, setLoading,
  toast
}) => {
  const executeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const requestUrl = urlMode === 'custom' ? customUrl : url;
      
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

  const loadJsonTemplate = (template: string) => {
    setBody(jsonTemplates[template as keyof typeof jsonTemplates]);
  };

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
  );
};
