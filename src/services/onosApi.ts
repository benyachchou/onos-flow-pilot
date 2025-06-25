
import axios, { AxiosInstance } from 'axios';

class OnosApiService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Toujours utiliser le proxy local - jamais d'appel direct
    this.baseUrl = '/onos/v1';
    this.api = this.createApiInstance();
    
    // Écouter les changements de configuration pour mettre à jour les credentials
    window.addEventListener('onosConfigChanged', this.handleConfigChange.bind(this));
  }

  private getStoredConfig() {
    const stored = localStorage.getItem('onosConfig');
    if (stored) {
      const config = JSON.parse(stored);
      return {
        ip: config.ip || '192.168.94.129',
        port: config.port || '8181',
        username: config.username || 'onos',
        password: config.password || 'rocks',
        // Toujours utiliser le proxy local pour les appels API
        baseUrl: '/onos/v1'
      };
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
    return axios.create({
      baseURL: this.baseUrl, // Toujours le proxy local
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: config.username,
        password: config.password
      }
    });
  }

  private handleConfigChange() {
    console.log('Configuration changed, updating API credentials...');
    // Recréer l'instance API avec les nouveaux credentials
    this.api = this.createApiInstance();
  }

  // Méthodes API - utilisent toujours le proxy
  async getDevices() {
    try {
      console.log('Fetching devices via proxy:', this.baseUrl + '/devices');
      const response = await this.api.get('/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }

  async getLinks() {
    try {
      console.log('Fetching links via proxy:', this.baseUrl + '/links');
      const response = await this.api.get('/links');
      return response.data;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }

  async getHosts() {
    try {
      console.log('Fetching hosts via proxy:', this.baseUrl + '/hosts');
      const response = await this.api.get('/hosts');
      return response.data;
    } catch (error) {
      console.error('Error fetching hosts:', error);
      throw error;
    }
  }

  async getFlows(deviceId?: string) {
    try {
      const url = deviceId ? `/flows/${deviceId}` : '/flows';
      console.log('Fetching flows via proxy:', this.baseUrl + url);
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  }

  async getTopology() {
    try {
      console.log('Fetching topology via proxy:', this.baseUrl + '/topology');
      const response = await this.api.get('/topology');
      return response.data;
    } catch (error) {
      console.error('Error fetching topology:', error);
      throw error;
    }
  }

  // Test de connexion - teste aussi via le proxy maintenant
  async testConnection() {
    try {
      console.log('Testing connection via proxy:', this.baseUrl + '/devices');
      const response = await this.api.get('/devices');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Connection test via proxy failed:', error);
      return { 
        success: false, 
        error: error.message || 'Connection failed' 
      };
    }
  }

  async executeRequest(method: string, endpoint: string, data?: any) {
    try {
      console.log('Executing request:', { method, endpoint, data });
      
      // Préparer les données pour la requête
      let requestData = undefined;
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        // Si c'est une string, essayer de la parser
        if (typeof data === 'string') {
          try {
            requestData = JSON.parse(data);
          } catch (e) {
            console.error('Invalid JSON data:', data);
            throw new Error('Corps JSON invalide');
          }
        } else {
          requestData = data;
        }
        console.log('Request data prepared:', requestData);
      }

      const response = await this.api.request({
        method: method.toLowerCase(),
        url: endpoint,
        data: requestData
      });

      console.log('Request successful:', response);
      return { 
        success: true, 
        data: response.data, 
        status: response.status 
      };
    } catch (error: any) {
      console.error('Request failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Request failed',
        status: error.response?.status 
      };
    }
  }
}

export const onosApi = new OnosApiService();
