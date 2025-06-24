
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { ApiRequest } from '../hooks/useApiRequests';

interface SavedCollectionProps {
  savedRequests: ApiRequest[];
  onLoadRequest: (request: ApiRequest) => void;
  onDeleteRequest: (id: string) => void;
}

export const SavedCollection: React.FC<SavedCollectionProps> = ({
  savedRequests,
  onLoadRequest,
  onDeleteRequest
}) => {
  return (
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
                <Button variant="outline" size="sm" onClick={() => onLoadRequest(request)}>
                  Charger
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDeleteRequest(request.id)}>
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
  );
};
