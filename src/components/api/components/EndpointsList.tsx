
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { onosEndpoints } from '../data/onosEndpoints';

interface EndpointsListProps {
  onLoadEndpoint: (endpoint: any) => void;
}

export const EndpointsList: React.FC<EndpointsListProps> = ({ onLoadEndpoint }) => {
  return (
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
                    onClick={() => onLoadEndpoint(endpoint)}
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
  );
};
