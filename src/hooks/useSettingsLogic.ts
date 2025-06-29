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
  }, [isInitialized, getLatestOnosConfig]);

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
      
      // Dispatch the event and also manually update the API credentials
      window.dispatchEvent(new CustomEvent('onosConfigChanged'));
      onosApi.updateCredentials();
      
      setConnectionStatus('unknown');
      
      console.log('Configuration saved successfully:', configToSave);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [controllerIp, controllerPort, username, password, isInitialized, saveOnosConfig]);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('unknown');
    
    try {
      // Save configuration first to ensure latest credentials are used
      await handleSaveConfig();
      
      console.log('Testing connection to:', `http://${controllerIp}:${controllerPort}/onos/v1/devices`);
      console.log('Using credentials:', { username, hasPassword: !!password });
      
      const result = await onosApi.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        toast({
          title: "Connexion réussie",
          description: "Le contrôleur ONOS répond correctement",
        });
      } else {
        setConnectionStatus('error');
        
        // Provide more specific error messages for authentication issues
        let errorMessage = result.error || "Impossible de se connecter au contrôleur";
        if (result.error?.includes('Authentication failed') || result.error?.includes('403')) {
          errorMessage = "Erreur d'authentification - vérifiez le nom d'utilisateur et le mot de passe";
        } else if (result.error?.includes('Unauthorized') || result.error?.includes('401')) {
          errorMessage = "Accès non autorisé - identifiants invalides";
        }
        
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez l'adresse IP, le port et les identifiants du contrôleur",
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