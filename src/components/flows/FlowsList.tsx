
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { Search, Loader2 } from 'lucide-react';

export const FlowsList = () => {
  const [deviceId, setDeviceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: flowsData, isLoading, refetch } = useQuery({
    queryKey: ['flows', deviceId],
    queryFn: () => onosApi.getFlows(deviceId || undefined),
    enabled: true,
    refetchInterval: 5000
  });

  const flows = flowsData?.flows || [];
  const filteredFlows = flows.filter((flow: any) =>
    flow.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flux OpenFlow ({filteredFlows.length})</CardTitle>
        <div className="flex gap-4">
          <Input
            placeholder="ID de l'appareil (optionnel)"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un flux..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => refetch()}>
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des flux...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlows.map((flow: any) => (
              <div
                key={flow.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{flow.id}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge>Priorité: {flow.priority}</Badge>
                    <Badge variant="outline">Table: {flow.tableId}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Appareil:</p>
                    <p className="font-mono text-xs">{flow.deviceId}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">État:</p>
                    <Badge variant={flow.state === 'ADDED' ? 'default' : 'secondary'}>
                      {flow.state}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Sélecteur:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(flow.selector, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Traitement:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(flow.treatment, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
