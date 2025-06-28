
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { onosApi } from '@/services/onosApi';
import { useSQLite } from '@/hooks/useSQLite';

export const useSettingsLogic = () => {
  const [controllerIp, setControllerIp] = useState('192.168.94.129');
  const [controllerPort, setControllerPort] = useState('8181');
  const [username, setUsername] = useState('onos');
  const [password, setPassword] = useState('rocks');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  const { 
    isInitialized, 
    error: dbError, 
    saveOnosConfig, 
    getLatestOnosConfig 
  } = useSQLite();

  // Load configuration once on mount
  useEffect(() => {
    const loadConfig = async () => {
      if (isInitialized) {
        try {
          const config = await getLatestOnosConfig();
          if (config) {
            setControllerIp(config.ip);
            setControllerPort(config.port);
            setUsername(config.username);
            setPassword(config.password);
          }
        } catch (error) {
          console.error('Error loading config from SQLite:', error);
        }
      } else {
        const stored = localStorage.getItem('onosConfig');
        if (stored) {
          try {
            const config = JSON.parse(stored);
            setControllerIp(config.ip || '192.168.94.129');
            setControllerPort(config.port || '8181');
            setUsername(config.username || 'onos');
            setPassword(config.password || 'rocks');
          } catch (error) {
            console.error('Error parsing localStorage config:', error);
          }
        }
      }
    };

    loadConfig();
  }, []);

  // Simplified save function
  const handleSaveConfig = useCallback(async () => {
    const config = {
      ip: controllerIp,
      port: controllerPort,
      username,
      password
    };

    try {
      if (isInitialized && saveOnosConfig) {
        await saveOnosConfig(config);
      }

      const configToSave = {
        ...config,
        baseUrl: '/onos/v1'
      };
      localStorage.setItem('onosConfig', JSON.stringify(configToSave));
      window.dispatchEvent(new CustomEvent('onosConfigChanged'));
      setConnectionStatus('unknown');
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [controllerIp, controllerPort, username, password, isInitialized, saveOnosConfig]);

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

  const manualSave = async () => {
    await handleSaveConfig();
    
    toast({
      title: "Paramètres sauvegardés",
      description: "Configuration sauvegardée avec succès",
      duration: 3000,
    });
  };

  return {
    controllerIp,
    controllerPort,
    username,
    password,
    testing,
    connectionStatus,
    isInitialized,
    dbError,
    setControllerIp,
    setControllerPort,
    setUsername,
    setPassword,
    handleSaveConfig,
    testConnection,
    manualSave
  };
};
