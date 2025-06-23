
import axios, { AxiosInstance } from 'axios';

class OnosApiService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = this.getStoredConfig().baseUrl;
    this.api = this.createApiInstance();
    
    // Écouter les changements de configuration
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
      baseURL: this.baseUrl,
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
    console.log('Configuration changed, updating API...');
    const newConfig = this.getStoredConfig();
    this.baseUrl = newConfig.baseUrl;
    this.api = this.createApiInstance();
  }

  // Méthodes API
  async getDevices() {
    try {
      const response = await this.api.get('/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }

  async getLinks() {
    try {
      const response = await this.api.get('/links');
      return response.data;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }

  async getHosts() {
    try {
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
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  }

  async getTopology() {
    try {
      const response = await this.api.get('/topology');
      return response.data;
    } catch (error) {
      console.error('Error fetching topology:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.api.get('/devices');
      return { success: true, data: response.data };
    } catch (error: any) {
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
