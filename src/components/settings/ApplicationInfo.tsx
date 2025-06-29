import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
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
        <div className="space-y-3">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>API ONOS:</strong> v1</p>
          <p><strong>Base de données:</strong> SQLite (WebAssembly)</p>
          <p><strong>URL du contrôleur:</strong> http://{controllerIp}:{controllerPort}/onos/v1</p>
          <p><strong>URL du proxy:</strong> /onos/v1 (via Vite dev server)</p>
          
          <div className="flex items-center gap-2">
            <strong>Statut de connexion:</strong> 
            {getStatusIcon()}
            <span className={
              connectionStatus === 'connected' ? 'text-green-600' :
              connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <strong>Base de données:</strong>
            {isInitialized ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={isInitialized ? 'text-green-600' : 'text-red-600'}>
              {isInitialized ? 'Connectée' : 'Initialisation...'}
            </span>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Identifiants ONOS par défaut:</strong><br/>
              Nom d'utilisateur: <code>onos</code><br/>
              Mot de passe: <code>rocks</code>
            </p>
          </div>
          
          {connectionStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Problème de connexion détecté:</strong><br/>
                • Vérifiez que le contrôleur ONOS est démarré<br/>
                • Vérifiez l'adresse IP et le port<br/>
                • Assurez-vous que les identifiants sont corrects (onos/rocks)<br/>
                • Vérifiez que le proxy Vite est configuré correctement
              </p>
            </div>
          )}
          
          <div className="text-sm text-green-600 mt-2">
            ✓ Sauvegarde automatique lors de la sortie des champs<br/>
            ✓ Configuration stockée en SQLite et localStorage<br/>
            ✓ Proxy Vite configuré pour éviter les problèmes CORS
          </div>
        </div>
      </CardContent>
    </Card>
  );
};