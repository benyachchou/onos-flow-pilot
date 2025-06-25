
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onosApi } from '@/services/onosApi';

export const Settings = () => {
  const [controllerIp, setControllerIp] = useState('192.168.94.129');
  const [controllerPort, setControllerPort] = useState('8181');
  const [username, setUsername] = useState('onos');
  const [password, setPassword] = useState('rocks');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const stored = localStorage.getItem('onosConfig');
    if (stored) {
      const config = JSON.parse(stored);
      setControllerIp(config.ip || '192.168.94.129');
      setControllerPort(config.port || '8181');
      setUsername(config.username || 'onos');
      setPassword(config.password || 'rocks');
    }
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('unknown');
    
    try {
      console.log('Testing connection to:', `http://${controllerIp}:${controllerPort}/onos/v1/devices`);
      
      const result = await onosApi.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        toast({
          title: "Connexion réussie",
          description: "Le contrôleur ONOS répond correctement",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Erreur de connexion",
          description: result.error || "Impossible de se connecter au contrôleur",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez l'adresse IP et le port du contrôleur",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = () => {
    const config = {
      ip: controllerIp,
      port: controllerPort,
      username,
      password,
      // Ne pas sauvegarder l'URL directe, utiliser toujours le proxy
      baseUrl: '/onos/v1'
    };

    localStorage.setItem('onosConfig', JSON.stringify(config));

    // Dispatch the correct event that the API service is listening for
    window.dispatchEvent(new CustomEvent('onosConfigChanged'));

    setConnectionStatus('unknown');
    
    toast({
      title: "Paramètres sauvegardés",
      description: "La configuration a été mise à jour",
    });
  };

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
    <div className="p-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="mr-3 h-8 w-8" />
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  onChange={(e) => setControllerIp(e.target.value)}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  value={controllerPort}
                  onChange={(e) => setControllerPort(e.target.value)}
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
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="onos"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="rocks"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={testing} variant="outline">
                <TestTube className="mr-2 h-4 w-4" />
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
              <Button onClick={saveSettings}>
                Sauvegarder
              </Button>
            </div>

            {connectionStatus !== 'unknown' && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-gray-50">
                {getStatusIcon()}
                <span className="text-sm">{getStatusText()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations sur l'application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>API ONOS:</strong> v1</p>
              <p><strong>URL actuelle:</strong> http://{controllerIp}:{controllerPort}/onos/v1</p>
              <div className="flex items-center gap-2">
                <strong>Statut:</strong> 
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
