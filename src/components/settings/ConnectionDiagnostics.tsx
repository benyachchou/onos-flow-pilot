// MÉTHODE 6: Composant de diagnostic de connexion
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { onosApiAlternative } from '@/services/onosApiAlternative';

interface DiagnosticResult {
  method: string;
  success: boolean;
  data?: any;
  error?: string;
  attempts?: number;
}

export const ConnectionDiagnostics: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: Connexion directe (sans proxy)
      console.log('Testing direct connection...');
      const directResult = await onosApiAlternative.testDirectConnection();
      setResults(prev => [...prev, directResult]);

      // Test 2: Méthodes d'authentification multiples
      console.log('Testing multiple auth methods...');
      const authResults = await onosApiAlternative.testMultipleAuthMethods();
      setResults(prev => [...prev, ...authResults]);

      // Test 3: Retry avec backoff
      console.log('Testing retry mechanism...');
      const retryResult = await onosApiAlternative.retryRequest('/devices');
      setResults(prev => [...prev, { method: 'retry-backoff', ...retryResult }]);

    } catch (error: any) {
      console.error('Diagnostic error:', error);
      setResults(prev => [...prev, {
        method: 'diagnostic-error',
        success: false,
        error: error.message
      }]);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (result: DiagnosticResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getMethodDescription = (method: string) => {
    const descriptions: { [key: string]: string } = {
      'direct': 'Connexion directe (sans proxy)',
      'axios-basic': 'Axios avec Basic Auth',
      'fetch-basic': 'Fetch API avec Basic Auth',
      'xhr': 'XMLHttpRequest natif',
      'retry-backoff': 'Retry avec backoff exponentiel'
    };
    return descriptions[method] || method;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Diagnostic de connexion ONOS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Teste différentes méthodes de connexion au contrôleur ONOS
          </p>
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              'Lancer le diagnostic'
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Résultats du diagnostic:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result)}
                  <div>
                    <p className="font-medium">{getMethodDescription(result.method)}</p>
                    {result.error && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                    {result.attempts && (
                      <p className="text-xs text-gray-500">Tentatives: {result.attempts}</p>
                    )}
                  </div>
                </div>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Succès" : "Échec"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Conseils de dépannage:</strong><br/>
            • Si "Connexion directe" fonctionne mais pas les autres: problème de proxy<br/>
            • Si aucune méthode ne fonctionne: vérifiez IP, port et identifiants<br/>
            • Si erreur 403/401: problème d'authentification (onos/rocks)<br/>
            • Si timeout: problème réseau ou ONOS non démarré
          </p>
        </div>
      </CardContent>
    </Card>
  );
};