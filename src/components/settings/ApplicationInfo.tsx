
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApplicationInfoProps {
  controllerIp: string;
  controllerPort: string;
  connectionStatus: 'unknown' | 'connected' | 'error';
  isInitialized: boolean;
}

export const ApplicationInfo: React.FC<ApplicationInfoProps> = ({
  controllerIp,
  controllerPort,
  connectionStatus,
  isInitialized
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'error':
        return 'Erreur de connexion';
      default:
        return 'Non testé';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations sur l'application</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>API ONOS:</strong> v1</p>
          <p><strong>Base de données:</strong> SQLite (WebAssembly)</p>
          <p><strong>URL actuelle:</strong> http://{controllerIp}:{controllerPort}/onos/v1</p>
          <div className="flex items-center gap-2">
            <strong>Statut:</strong> 
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
          <div className="flex items-center gap-2">
            <strong>DB Status:</strong>
            {isInitialized ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>{isInitialized ? 'Connectée' : 'Initialisation...'}</span>
          </div>
          <div className="text-sm text-green-600 mt-2">
            ✓ Sauvegarde lors de la sortie des champs
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
