
import axios, { AxiosInstance } from 'axios';

class OnosApiService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Utiliser le proxy local au lieu de l'IP directe du contrôleur
    this.baseUrl = '/onos/v1';
    this.api = this.createApiInstance();
    
    // Écouter les changements de configuration pour les tests de connexion uniquement
    window.addEventListener('onosConfigChanged', this.handleConfigChange.bind(this));
  }

  private getStoredConfig() {
    const stored = localStorage.getItem('onosConfig');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      ip: '192.168.94.129',
      port: '8181',
      username: 'onos',
      password: 'rocks',
      baseUrl: 'http://192.168.94.129:8181/onos/v1'
    };
  }

  private createApiInstance(): AxiosInstance {
    const config = this.getStoredConfig();
    return axios.create({
      baseURL: this.baseUrl, // Utiliser le proxy local
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

  // Méthodes API - utilisent maintenant le proxy
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

  // Test de connexion - utilise l'IP directe pour vérifier la connectivité
  async testConnection() {
    try {
      const config = this.getStoredConfig();
      const directApi = axios.create({
        baseURL: config.baseUrl,
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
      
      console.log('Testing direct connection to:', config.baseUrl + '/devices');
      const response = await directApi.get('/devices');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Direct connection test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Connection failed' 
      };
    }
  }

  async executeRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await this.api.request({
        method: method.toLowerCase(),
        url: endpoint,
        data
      });
      return { success: true, data: response.data, status: response.status };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Request failed',
        status: error.response?.status 
      };
    }
  }
}

export const onosApi = new OnosApiService();
