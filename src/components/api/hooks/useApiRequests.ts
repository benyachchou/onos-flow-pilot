
import { useState, useEffect } from 'react';
import { useSQLite } from '@/hooks/useSQLite';

export interface ApiRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp?: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  responseTime: number;
  size: number;
}

export const useApiRequests = () => {
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
  const [urlMode, setUrlMode] = useState<'preset' | 'custom'>('preset');

  const { 
    isInitialized, 
    saveApiRequest, 
    getAllApiRequests, 
    deleteApiRequest: deleteSQLiteRequest 
  } = useSQLite();

  useEffect(() => {
    const loadSavedRequests = async () => {
      if (isInitialized) {
        const requests = await getAllApiRequests();
        setSavedRequests(requests);
      }
    };

    loadSavedRequests();
  }, [isInitialized, getAllApiRequests]);

  const saveRequest = async (toast: any) => {
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

    await saveApiRequest(newRequest);
    
    // Recharger les requêtes sauvegardées
    const requests = await getAllApiRequests();
    setSavedRequests(requests);
    
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
  };

  const deleteRequest = async (id: string, toast: any) => {
    await deleteSQLiteRequest(id);
    
    // Recharger les requêtes sauvegardées
    const requests = await getAllApiRequests();
    setSavedRequests(requests);
    
    toast({
      title: "Requête supprimée",
    });
  };

  return {
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
    deleteRequest,
    isInitialized
  };
};
