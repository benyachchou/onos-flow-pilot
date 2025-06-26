
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
import { ApiResponse } from '../hooks/useApiRequests';

interface RequestResponseProps {
  response: ApiResponse | null;
}

export const RequestResponse: React.FC<RequestResponseProps> = ({
  response
}) => {
  if (!response) {
    return null;
  }

  return (
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
  );
};
