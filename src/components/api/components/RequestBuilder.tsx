
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { onosApi } from '@/services/onosApi';
import { ApiResponse } from '../hooks/useApiRequests';
import { RequestForm } from './RequestForm';
import { RequestBody } from './RequestBody';
import { RequestActions } from './RequestActions';
import { RequestResponse } from './RequestResponse';

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
      
      if (!requestUrl.trim()) {
        throw new Error('URL de la requête requise');
      }

      console.log('Preparing request:', { method, requestUrl, body });

      let requestBody = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        if (body.trim()) {
          try {
            JSON.parse(body);
            requestBody = body;
          } catch (e) {
            throw new Error('Format JSON invalide dans le corps de la requête');
          }
        }
      }

      console.log('Sending request with body:', requestBody);

      const result = await onosApi.executeRequest(method, requestUrl, requestBody);
      
      const responseTime = Date.now() - startTime;
      const responseData = result.data || result.error;
      const responseSize = JSON.stringify(responseData).length;

      setResponse({
        status: result.status || (result.success ? 200 : 500),
        statusText: result.success ? 'OK' : 'Error',
        data: responseData,
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
          description: result.error || 'Erreur inconnue',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      setResponse({
        status: 400,
        statusText: 'Bad Request',
        data: { error: error.message },
        headers: {},
        responseTime,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Construire une requête</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RequestForm
          method={method}
          setMethod={setMethod}
          url={url}
          setUrl={setUrl}
          customUrl={customUrl}
          setCustomUrl={setCustomUrl}
          urlMode={urlMode}
          setUrlMode={setUrlMode}
          loading={loading}
          onExecute={executeRequest}
        />

        <RequestActions
          method={method}
          url={url}
          customUrl={customUrl}
          urlMode={urlMode}
          body={body}
          toast={toast}
        />

        <RequestBody
          method={method}
          body={body}
          setBody={setBody}
        />

        <RequestResponse response={response} />
      </CardContent>
    </Card>
  );
};
