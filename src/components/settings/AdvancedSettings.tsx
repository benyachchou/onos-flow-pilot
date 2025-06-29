// MÉTHODE 9: Paramètres avancés avec sélection de méthode de connexion
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, TestTube } from 'lucide-react';
import { onosApiAlternative } from '@/services/onosApiAlternative';
import { onosApiMock } from '@/services/onosApiMock';

type ConnectionMode = 'proxy' | 'direct' | 'mock' | 'alternative';

export const AdvancedSettings: React.FC = () => {
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('proxy');
  const [enableRetry, setEnableRetry] = useState(true);
  const [enableMockMode, setEnableMockMode] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const connectionModes = [
    { value: 'proxy', label: 'Proxy Vite (Recommandé)', description: 'Via le serveur de développement Vite' },
    { value: 'direct', label: 'Connexion directe', description: 'Directement au contrôleur ONOS' },
    { value: 'alternative', label: 'Méthodes alternatives', description: 'Fetch, XHR, retry automatique' },
    { value: 'mock', label: 'Mode simulation', description: 'Données simulées pour développement' }
  ];

  const testConnectionMode = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      let result;
      
      switch (connectionMode) {
        case 'direct':
          result = await onosApiAlternative.testDirectConnection();
          break;
        case 'alternative':
          result = await onosApiAlternative.testMultipleAuthMethods();
          break;
        case 'mock':
          result = await onosApiMock.testConnection();
          break;
        default:
          // Test proxy normal
          result = { success: false, error: 'Mode proxy - utilisez le test de connexion principal' };
      }
      
      setTestResults(result);
    } catch (error: any) {
      setTestResults({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const applySettings = () => {
    // Sauvegarder les paramètres avancés
    const advancedSettings = {
      connectionMode,
      enableRetry,
      enableMockMode,
      timestamp: Date.now()
    };
    
    localStorage.setItem('onosAdvancedSettings', JSON.stringify(advancedSettings));
    
    // Dispatcher un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('onosAdvancedSettingsChanged', {
      detail: advancedSettings
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Paramètres avancés de connexion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Mode de connexion</Label>
          <Select value={connectionMode} onValueChange={(value: ConnectionMode) => setConnectionMode(value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {connectionModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-gray-500">{mode.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Retry automatique</Label>
            <p className="text-sm text-gray-500">Réessayer automatiquement en cas d'échec</p>
          </div>
          <Switch checked={enableRetry} onCheckedChange={setEnableRetry} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Mode simulation</Label>
            <p className="text-sm text-gray-500">Utiliser des données simulées</p>
          </div>
          <Switch checked={enableMockMode} onCheckedChange={setEnableMockMode} />
        </div>

        <div className="flex gap-2">
          <Button onClick={testConnectionMode} disabled={testing} variant="outline">
            <TestTube className="mr-2 h-4 w-4" />
            {testing ? 'Test...' : 'Tester ce mode'}
          </Button>
          <Button onClick={applySettings}>
            <Zap className="mr-2 h-4 w-4" />
            Appliquer les paramètres
          </Button>
        </div>

        {testResults && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={testResults.success ? "default" : "destructive"}>
                {testResults.success ? "Succès" : "Échec"}
              </Badge>
              <span className="text-sm font-medium">Résultat du test</span>
            </div>
            {testResults.error && (
              <p className="text-sm text-red-600">{testResults.error}</p>
            )}
            {testResults.data && (
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(testResults.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
          <strong>Note:</strong> Ces paramètres sont expérimentaux. Le mode proxy est recommandé pour la plupart des cas d'usage.
          Le mode simulation peut être utile pour le développement sans contrôleur ONOS.
        </div>
      </CardContent>
    </Card>
  );
};