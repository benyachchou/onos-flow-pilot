
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TestTube, Database } from 'lucide-react';

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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ip">Adresse IP</Label>
            <Input
              id="ip"
              value={controllerIp}
              onChange={(e) => onIpChange(e.target.value)}
              onBlur={onSave}
              placeholder="192.168.1.100"
            />
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
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onTestConnection} disabled={testing} variant="outline">
            <TestTube className="mr-2 h-4 w-4" />
            {testing ? 'Test en cours...' : 'Tester la connexion'}
          </Button>
          <Button onClick={onSave} disabled={!isInitialized}>
            <Database className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
