
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const DevicesList = () => {
  const { data: devicesData, isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 3000
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des appareils...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-red-500">
          <XCircle className="h-8 w-8 mr-2" />
          Erreur lors du chargement des appareils
        </CardContent>
      </Card>
    );
  }

  const devices = devicesData?.devices || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Liste des Appareils ({devices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices.map((device: any) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {device.available ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{device.id}</h3>
                  <p className="text-sm text-gray-500">
                    Type: {device.type} | Driver: {device.driver}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={device.available ? "default" : "destructive"}>
                  {device.available ? "En ligne" : "Hors ligne"}
                </Badge>
                <Badge variant="outline">
                  Rôle: {device.role || "MASTER"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
