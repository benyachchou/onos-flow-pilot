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

  // Listen for authentication errors from API calls
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      console.log('Authentication error detected:', event.detail);
      setConnectionStatus('error');
      
      toast({
        title: "Erreur d'authentification",
        description: "Les identifiants ONOS sont incorrects. Veuillez vérifier vos paramètres de connexion dans les Paramètres.",
        variant: "destructive",
        duration: 8000, // Longer duration for important auth errors
      });
    };

    window.addEventListener('onosAuthError', handleAuthError as EventListener);
    
    return () => {
      window.removeEventListener('onosAuthError', handleAuthError as EventListener);
    };
  }, [toast]);

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
            console.log('Loaded config from SQLite:', { 
              ip: config.ip, 
              port: config.port, 
              username: config.username,
              hasPassword: !!config.password 
            });
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
            console.log('Loaded config from localStorage:', { 
              ip: config.ip, 
              port: config.port, 
              username: config.username,
              hasPassword: !!config.password 
            });
          } catch (error) {
            console.error('Error parsing localStorage config:', error);
          }
        }
      }
    };

    loadConfig();
  }, [isInitialized, getLatestOnosConfig]);

  // Simplified save function with better error handling
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
        console.log('Config saved to SQLite successfully');
      }

      const configToSave = {
        ...config,
        baseUrl: '/onos/v1'
      };
      localStorage.setItem('onosConfig', JSON.stringify(configToSave));
      
      // Dispatch the event and also manually update the API credentials
      window.dispatchEvent(new CustomEvent('onosConfigChanged'));
      onosApi.updateCredentials();
      
      // Reset connection status when config changes
      setConnectionStatus('unknown');
      
      console.log('Configuration saved successfully:', {
        ip: configToSave.ip,
        port: configToSave.port,
        username: configToSave.username,
        hasPassword: !!configToSave.password
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  }, [controllerIp, controllerPort, username, password, isInitialized, saveOnosConfig, toast]);

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
          description: "Le contrôleur ONOS répond correctement avec les identifiants fournis",
          duration: 5000,
        });
      } else {
        setConnectionStatus('error');
        
        // Provide more specific error messages for authentication issues
        let errorMessage = result.error || "Impossible de se connecter au contrôleur";
        let toastTitle = "Erreur de connexion";
        
        if (result.error?.includes('Authentication failed') || result.error?.includes('403')) {
          errorMessage = "Erreur d'authentification - vérifiez le nom d'utilisateur et le mot de passe";
          toastTitle = "Erreur d'authentification";
        } else if (result.error?.includes('Unauthorized') || result.error?.includes('401')) {
          errorMessage = "Accès non autorisé - identifiants invalides";
          toastTitle = "Accès refusé";
        } else if (result.error?.includes('No response from server')) {
          errorMessage = "Aucune réponse du serveur - vérifiez l'adresse IP et le port";
          toastTitle = "Serveur inaccessible";
        }
        
        toast({
          title: toastTitle,
          description: errorMessage,
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
      toast({
        title: "Erreur de test de connexion",
        description: "Une erreur inattendue s'est produite lors du test de connexion",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setTesting(false);
    }
  };

  const manualSave = async () => {
    try {
      await handleSaveConfig();
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Configuration sauvegardée avec succès. Les nouveaux identifiants seront utilisés pour les prochaines requêtes.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
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