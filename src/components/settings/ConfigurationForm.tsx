import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TestTube, Database, AlertCircle } from 'lucide-react';

interface ConfigurationFormProps {
  controllerIp: string;
  controllerPort: string;
  username: string;
  password: string;
  onIpChange: (value: string) => void;
  onPortChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSave: () => void;
  onTestConnection: () => void;
  testing: boolean;
  isInitialized: boolean;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  controllerIp,
  controllerPort,
  username,
  password,
  onIpChange,
  onPortChange,
  onUsernameChange,
  onPasswordChange,
  onSave,
  onTestConnection,
  testing,
  isInitialized
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration du Contrôleur ONOS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> Les identifiants ONOS par défaut sont généralement:<br/>
              Nom d'utilisateur: <code>onos</code> | Mot de passe: <code>rocks</code>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ip">Adresse IP du contrôleur</Label>
            <Input
              id="ip"
              value={controllerIp}
              onChange={(e) => onIpChange(e.target.value)}
              onBlur={onSave}
              placeholder="192.168.94.129"
            />
            <p className="text-xs text-gray-500 mt-1">
              IP où le contrôleur ONOS est accessible
            </p>
          </div>
          <div>
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={controllerPort}
              onChange={(e) => onPortChange(e.target.value)}
              onBlur={onSave}
              placeholder="8181"
            />
            <p className="text-xs text-gray-500 mt-1">
              Port REST API ONOS (généralement 8181)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              onBlur={onSave}
              placeholder="onos"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nom d'utilisateur ONOS (défaut: onos)
            </p>
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onBlur={onSave}
              placeholder="rocks"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mot de passe ONOS (défaut: rocks)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onTestConnection} disabled={testing} variant="outline">
            <TestTube className="mr-2 h-4 w-4" />
            {testing ? 'Test en cours...' : 'Tester la connexion'}
          </Button>
          <Button onClick={onSave} disabled={!isInitialized}>
            <Database className="mr-2 h-4 w-4" />
            Sauvegarder manuellement
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> La configuration est automatiquement sauvegardée quand vous quittez un champ.
          Le proxy Vite redirige les requêtes vers http://{controllerIp}:{controllerPort}/onos/v1
        </div>
      </CardContent>
    </Card>
  );
};