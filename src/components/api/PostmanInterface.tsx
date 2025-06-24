
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiRequests } from './hooks/useApiRequests';
import { RequestBuilder } from './components/RequestBuilder';
import { EndpointsList } from './components/EndpointsList';
import { TemplateManager } from './components/TemplateManager';
import { SavedCollection } from './components/SavedCollection';
import { jsonTemplates } from './data/jsonTemplates';

export const PostmanInterface = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const { toast } = useToast();
  
  const {
    method, setMethod,
    url, setUrl,
    customUrl, setCustomUrl,
    headers, setHeaders,
    body, setBody,
    response, setResponse,
    loading, setLoading,
    savedRequests,
    urlMode, setUrlMode,
    saveRequest,
    loadRequest,
    deleteRequest
  } = useApiRequests();

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

  const handleLoadRequest = (request: any) => {
    loadRequest(request);
    setActiveTab('builder');
  };

  const handleDeleteRequest = (id: string) => {
    deleteRequest(id, toast);
  };

  const handleSaveRequest = () => {
    saveRequest(toast);
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
          <Button onClick={handleSaveRequest}>
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
          <RequestBuilder
            method={method}
            setMethod={setMethod}
            url={url}
            setUrl={setUrl}
            customUrl={customUrl}
            setCustomUrl={setCustomUrl}
            urlMode={urlMode}
            setUrlMode={setUrlMode}
            body={body}
            setBody={setBody}
            response={response}
            setResponse={setResponse}
            loading={loading}
            setLoading={setLoading}
            toast={toast}
          />
        </TabsContent>

        <TabsContent value="endpoints">
          <EndpointsList onLoadEndpoint={loadEndpoint} />
        </TabsContent>

        <TabsContent value="collection">
          <SavedCollection
            savedRequests={savedRequests}
            onLoadRequest={handleLoadRequest}
            onDeleteRequest={handleDeleteRequest}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager onLoadTemplate={loadJsonTemplate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
