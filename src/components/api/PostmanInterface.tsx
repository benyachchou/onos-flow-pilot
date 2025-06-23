
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Plus, Download } from 'lucide-react';

export const PostmanInterface = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async () => {
    setLoading(true);
    try {
      // Simulated API call for now
      setTimeout(() => {
        setResponse({
          status: 200,
          data: { message: 'Request executed successfully' }
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setResponse({
        status: 500,
        error: 'Request failed'
      });
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">API Explorer</h1>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Requête
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Builder</CardTitle>
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
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter request URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={executeRequest} disabled={loading}>
              <Play className="mr-2 h-4 w-4" />
              {loading ? 'Executing...' : 'Send'}
            </Button>
          </div>

          {(method === 'POST' || method === 'PUT') && (
            <div>
              <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
              <Textarea
                placeholder="Enter JSON body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {response && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Response</h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
