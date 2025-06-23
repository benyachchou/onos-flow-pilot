
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Settings = () => {
  const [controllerIp, setControllerIp] = useState('192.168.94.129');
  const [controllerPort, setControllerPort] = useState('8181');
  const [username, setUsername] = useState('onos');
  const [password, setPassword] = useState('rocks');
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const savedIp = localStorage.getItem('onos_controller_ip');
    const savedPort = localStorage.getItem('onos_controller_port');
    const savedUsername = localStorage.getItem('onos_username');
    const savedPassword = localStorage.getItem('onos_password');

    if (savedIp) setControllerIp(savedIp);
    if (savedPort) setControllerPort(savedPort);
    if (savedUsername) setUsername(savedUsername);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch(`http://${controllerIp}:${controllerPort}/onos/v1/devices`, {
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Connexion réussie",
          description: "Le contrôleur ONOS répond correctement",
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: `Code d'erreur: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au contrôleur",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('onos_controller_ip', controllerIp);
    localStorage.setItem('onos_controller_port', controllerPort);
    localStorage.setItem('onos_username', username);
    localStorage.setItem('onos_password', password);

    // Dispatch event to update API configuration
    window.dispatchEvent(new CustomEvent('configUpdated', {
      detail: { ip: controllerIp, port: controllerPort, username, password }
    }));

    toast({
      title: "Paramètres sauvegardés",
      description: "La configuration a été mise à jour",
    });
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
              <p><strong>Statut:</strong> Connecté</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
