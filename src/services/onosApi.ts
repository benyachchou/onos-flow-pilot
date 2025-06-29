import axios, { AxiosInstance } from 'axios';

class OnosApiService {
  private api: AxiosInstance;
  private baseUrl: string;
  private authErrorCallbacks: Set<() => void> = new Set();

  constructor() {
    // Toujours utiliser le proxy local - jamais d'appel direct
    this.baseUrl = '/onos/v1';
    this.api = this.createApiInstance();
    
    // Écouter les changements de configuration pour mettre à jour les credentials
    window.addEventListener('onosConfigChanged', this.handleConfigChange.bind(this));
  }

  // Method to register callbacks for authentication errors
  public onAuthError(callback: () => void) {
    this.authErrorCallbacks.add(callback);
    return () => this.authErrorCallbacks.delete(callback);
  }

  private notifyAuthError() {
    this.authErrorCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in auth error callback:', error);
      }
    });
  }

  private getStoredConfig() {
    const stored = localStorage.getItem('onosConfig');
    if (stored) {
      try {
        const config = JSON.parse(stored);
        return {
          ip: config.ip || '192.168.94.129',
          port: config.port || '8181',
          username: config.username || 'onos',
          password: config.password || 'rocks',
          // Toujours utiliser le proxy local pour les appels API
          baseUrl: '/onos/v1'
        };
      } catch (error) {
        console.error('Error parsing stored config:', error);
      }
    }
    return {
      ip: '192.168.94.129',
      port: '8181',
      username: 'onos',
      password: 'rocks',
      baseUrl: '/onos/v1'
    };
  }

  private createApiInstance(): AxiosInstance {
    const config = this.getStoredConfig();
    console.log('Creating API instance with config:', { 
      baseURL: this.baseUrl, 
      username: config.username,
      // Don't log password for security
      hasPassword: !!config.password 
    });
    
    const instance = axios.create({
      baseURL: this.baseUrl, // Toujours le proxy local
      timeout: 15000, // Increased timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: config.username.trim(), // Trim whitespace
        password: config.password.trim()  // Trim whitespace
      }
    });

    // Add request interceptor to ensure auth is always up to date
    instance.interceptors.request.use((config) => {
      const currentConfig = this.getStoredConfig();
      config.auth = {
        username: currentConfig.username.trim(),
        password: currentConfig.password.trim()
      };
      console.log('Request interceptor - using credentials:', {
        username: config.auth.username,
        hasPassword: !!config.auth.password
      });
      return config;
    });

    // Add response interceptor to handle auth errors
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication failed - credentials may be incorrect');
          console.error('Response details:', {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers
          });
          // Notify components about authentication error
          this.notifyAuthError();
          // Dispatch a global event for authentication errors
          window.dispatchEvent(new CustomEvent('onosAuthError', {
            detail: {
              status: error.response.status,
              message: error.response.status === 401 ? 'Unauthorized - invalid credentials' : 'Authentication failed - check credentials in Settings'
            }
          }));
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }

  private handleConfigChange() {
    console.log('Configuration changed, updating API credentials...');
    // Recréer l'instance API avec les nouveaux credentials
    this.api = this.createApiInstance();
  }

  // Method to manually update credentials - useful for immediate updates
  public updateCredentials() {
    console.log('Manually updating API credentials...');
    this.api = this.createApiInstance();
  }

  // Helper method to handle authentication errors consistently
  private handleAuthError(error: any, operation: string) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error(`Authentication error in ${operation} - credentials invalid`);
      console.error('Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      // Don't throw the error, just log it and return empty result
      return true; // Indicates auth error was handled
    }
    return false; // Not an auth error
  }

  // Méthodes API - utilisent toujours le proxy avec meilleure gestion d'erreur
  async getDevices() {
    try {
      console.log('Fetching devices via proxy:', this.baseUrl + '/devices');
      const response = await this.api.get('/devices');
      return response.data;
    } catch (error: any) {
      // Handle auth errors gracefully - return empty result and let interceptor handle notifications
      if (this.handleAuthError(error, 'getDevices')) {
        return { devices: [] };
      }
      // For non-auth errors, still throw to maintain error handling
      console.error('Non-auth error in getDevices:', error);
      throw error;
    }
  }

  async getLinks() {
    try {
      console.log('Fetching links via proxy:', this.baseUrl + '/links');
      const response = await this.api.get('/links');
      return response.data;
    } catch (error: any) {
      // Handle auth errors gracefully - return empty result and let interceptor handle notifications
      if (this.handleAuthError(error, 'getLinks')) {
        return { links: [] };
      }
      // For non-auth errors, still throw to maintain error handling
      console.error('Non-auth error in getLinks:', error);
      throw error;
    }
  }

  async getHosts() {
    try {
      console.log('Fetching hosts via proxy:', this.baseUrl + '/hosts');
      const response = await this.api.get('/hosts');
      return response.data;
    } catch (error: any) {
      // Handle auth errors gracefully - return empty result and let interceptor handle notifications
      if (this.handleAuthError(error, 'getHosts')) {
        return { hosts: [] };
      }
      // For non-auth errors, still throw to maintain error handling
      console.error('Non-auth error in getHosts:', error);
      throw error;
    }
  }

  async getFlows(deviceId?: string) {
    try {
      const url = deviceId ? `/flows/${deviceId}` : '/flows';
      console.log('Fetching flows via proxy:', this.baseUrl + url);
      const response = await this.api.get(url);
      return response.data;
    } catch (error: any) {
      // Handle auth errors gracefully - return empty result and let interceptor handle notifications
      if (this.handleAuthError(error, 'getFlows')) {
        return { flows: [] };
      }
      // For non-auth errors, still throw to maintain error handling
      console.error('Non-auth error in getFlows:', error);
      throw error;
    }
  }

  async getTopology() {
    try {
      console.log('Fetching topology via proxy:', this.baseUrl + '/topology');
      const response = await this.api.get('/topology');
      return response.data;
    } catch (error: any) {
      // Handle auth errors gracefully - return empty result and let interceptor handle notifications
      if (this.handleAuthError(error, 'getTopology')) {
        return { topology: {} };
      }
      // For non-auth errors, still throw to maintain error handling
      console.error('Non-auth error in getTopology:', error);
      throw error;
    }
  }

  // Test de connexion - teste aussi via le proxy maintenant
  async testConnection() {
    try {
      console.log('Testing connection via proxy:', this.baseUrl + '/devices');
      const config = this.getStoredConfig();
      console.log('Testing with credentials:', {
        username: config.username,
        hasPassword: !!config.password,
        passwordLength: config.password.length
      });
      
      const response = await this.api.get('/devices');
      console.log('Connection test successful:', response.status);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Connection test via proxy failed:', error);
      let errorMessage = 'Connection failed';
      
      if (error.response?.status === 403) {
        errorMessage = 'Authentication failed - check username and password';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - invalid credentials';
      } else if (error.response) {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No response from server - check network connection';
      } else {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  async executeRequest(method: string, endpoint: string, data?: any) {
    try {
      console.log('Executing request:', { method, endpoint, data });
      
      // Préparer les données pour la requête
      let requestData = undefined;
      
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        // Si c'est une string JSON, essayer de la parser
        if (typeof data === 'string') {
          try {
            // Vérifier si la string n'est pas vide
            if (data.trim()) {
              requestData = JSON.parse(data);
              console.log('Parsed JSON data:', requestData);
            }
          } catch (e) {
            console.error('Invalid JSON data:', data, e);
            throw new Error('Format JSON invalide: ' + e.message);
          }
        } else if (typeof data === 'object' && data !== null) {
          requestData = data;
          console.log('Object data:', requestData);
        }
      }

      console.log('Final request data:', requestData);

      const response = await this.api.request({
        method: method.toLowerCase(),
        url: endpoint,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Request successful:', response);
      return { 
        success: true, 
        data: response.data, 
        status: response.status 
      };
    } catch (error: any) {
      console.error('Request failed:', error);
      
      // Améliorer le message d'erreur
      let errorMessage = 'Request failed';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Authentication failed - check credentials in Settings';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized - invalid credentials';
        } else {
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.response?.statusText || 
                        `HTTP ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      } else {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        status: error.response?.status || 500
      };
    }
  }
}

export const onosApi = new OnosApiService();