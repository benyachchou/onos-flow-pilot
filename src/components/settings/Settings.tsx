import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, TestTube, CheckCircle, XCircle, RefreshCw, AlertTriangle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onosApi } from '@/services/onosApi';

export const Settings = () => {
  const [controllerIp, setControllerIp] = useState('192.168.94.129');
  const [controllerPort, setControllerPort] = useState('8181');
  const [username, setUsername] = useState('onos');
  const [password, setPassword] = useState('rocks');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [configChanged, setConfigChanged] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
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

  // Track if IP/Port has changed
  useEffect(() => {
    const stored = localStorage.getItem('onosConfig');
    if (stored) {
      const config = JSON.parse(stored);
      const hasChanged = (
        controllerIp !== (config.ip || '192.168.94.129') ||
        controllerPort !== (config.port || '8181')
      );
      setConfigChanged(hasChanged);
    }
  }, [controllerIp, controllerPort]);

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
      baseUrl: '/onos/v1'
    };

    localStorage.setItem('onosConfig', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('onosConfigChanged'));

    setConnectionStatus('unknown');
    setConfigChanged(false);
    
    toast({
      title: "Paramètres sauvegardés",
      description: "Configuration mise à jour. Cliquez sur 'Redémarrer automatiquement' pour appliquer les changements.",
      duration: 5000,
    });
  };

  const handleAutoRestart = async () => {
    setIsRestarting(true);
    
    try {
      // Créer un script de redémarrage automatique
      const restartScript = `#!/bin/bash
# Script de redémarrage automatique généré
export VITE_ONOS_IP=${controllerIp}
export VITE_ONOS_PORT=${controllerPort}
npm run dev
`;

      // Créer un blob avec le script
      const blob = new Blob([restartScript], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'restart-dev-server.sh';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Script téléchargé",
        description: "Exécutez le script 'restart-dev-server.sh' dans votre terminal pour redémarrer avec la nouvelle IP.",
        duration: 8000,
      });

      // Essayer de recharger la page après quelques secondes
      setTimeout(() => {
        toast({
          title: "Rechargement automatique",
          description: "La page va se recharger pour tenter d'appliquer les nouveaux paramètres...",
          duration: 3000,
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la génération du script:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le script automatique. Redémarrez manuellement le serveur.",
        variant: "destructive",
      });
    } finally {
      setIsRestarting(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
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

      {/* Enhanced notice with auto-restart option */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-blue-800 font-medium mb-2">Redémarrage Automatique</h3>
            <p className="text-blue-700 text-sm mb-3">
              Pour changer l'adresse IP du contrôleur ONOS, le serveur de développement doit être redémarré.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleAutoRestart} 
                disabled={isRestarting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isRestarting ? 'Génération...' : 'Redémarrer automatiquement'}
              </Button>
              <div className="text-blue-600 text-xs self-center">
                Télécharge un script et recharge la page
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original manual instruction notice */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="text-orange-800 font-medium mb-2">Méthode Manuelle</h3>
            <p className="text-orange-700 text-sm mb-2">
              Ou redémarrez manuellement avec les variables d'environnement:
            </p>
            <div className="bg-orange-100 p-2 rounded text-sm font-mono">
              VITE_ONOS_IP={controllerIp} VITE_ONOS_PORT={controllerPort} npm run dev
            </div>
          </div>
        </div>
      </div>

      {configChanged && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-800 font-medium">Configuration modifiée</h3>
              <p className="text-yellow-700 text-sm">
                L'adresse IP ou le port a été modifié. Utilisez le redémarrage automatique pour appliquer les changements.
              </p>
            </div>
            <Button onClick={reloadPage} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger
            </Button>
          </div>
        </div>
      )}

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
