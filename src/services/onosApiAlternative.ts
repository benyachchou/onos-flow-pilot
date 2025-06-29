// MÉTHODE 1: Service API avec authentification Basic directe
import axios, { AxiosInstance } from 'axios';

class OnosApiAlternative {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/onos/v1';
    this.api = this.createApiInstance();
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
          password: config.password || 'rocks'
        };
      } catch (error) {
        console.error('Error parsing stored config:', error);
      }
    }
    return {
      ip: '192.168.94.129',
      port: '8181',
      username: 'onos',
      password: 'rocks'
    };
  }

  private createApiInstance(): AxiosInstance {
    const config = this.getStoredConfig();
    
    // Créer l'en-tête Authorization Basic manuellement
    const credentials = btoa(`${config.username}:${config.password}`);
    
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'Cache-Control': 'no-cache'
      }
    });
  }

  // MÉTHODE 2: Requête avec fetch au lieu d'axios
  async fetchWithBasicAuth(endpoint: string, options: RequestInit = {}) {
    const config = this.getStoredConfig();
    const credentials = btoa(`${config.username}:${config.password}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // MÉTHODE 3: Connexion directe sans proxy (pour test)
  async testDirectConnection() {
    const config = this.getStoredConfig();
    const directUrl = `http://${config.ip}:${config.port}/onos/v1/devices`;
    const credentials = btoa(`${config.username}:${config.password}`);

    try {
      const response = await fetch(directUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'Cache-Control': 'no-cache'
        },
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, method: 'direct' };
      } else {
        return { 
          success: false, 
          error: `Direct connection failed: ${response.status} ${response.statusText}`,
          method: 'direct'
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: `Direct connection error: ${error.message}`,
        method: 'direct'
      };
    }
  }

  // MÉTHODE 4: Test avec différents formats d'authentification
  async testMultipleAuthMethods() {
    const config = this.getStoredConfig();
    const endpoint = '/devices';
    const results: any[] = [];

    // Test 1: Basic Auth avec axios
    try {
      const response1 = await this.api.get(endpoint);
      results.push({ method: 'axios-basic', success: true, data: response1.data });
    } catch (error: any) {
      results.push({ method: 'axios-basic', success: false, error: error.message });
    }

    // Test 2: Fetch avec Basic Auth
    try {
      const data2 = await this.fetchWithBasicAuth(endpoint);
      results.push({ method: 'fetch-basic', success: true, data: data2 });
    } catch (error: any) {
      results.push({ method: 'fetch-basic', success: false, error: error.message });
    }

    // Test 3: XMLHttpRequest
    try {
      const data3 = await this.testWithXHR(endpoint);
      results.push({ method: 'xhr', success: true, data: data3 });
    } catch (error: any) {
      results.push({ method: 'xhr', success: false, error: error.message });
    }

    return results;
  }

  private testWithXHR(endpoint: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const config = this.getStoredConfig();
      const xhr = new XMLHttpRequest();
      const credentials = btoa(`${config.username}:${config.password}`);

      xhr.open('GET', `${this.baseUrl}${endpoint}`, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
      xhr.setRequestHeader('Cache-Control', 'no-cache');

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`XHR failed: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('XHR network error'));
      xhr.send();
    });
  }

  // MÉTHODE 5: Retry avec backoff exponentiel
  async retryRequest(endpoint: string, maxRetries = 3) {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} for ${endpoint}`);
        
        // Attendre avant de réessayer (backoff exponentiel)
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await this.api.get(endpoint);
        console.log(`Success on attempt ${attempt}`);
        return { success: true, data: response.data, attempts: attempt };
        
      } catch (error: any) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        // Si c'est une erreur d'auth, pas la peine de réessayer
        if (error.response?.status === 401 || error.response?.status === 403) {
          break;
        }
      }
    }
    
    return { 
      success: false, 
      error: lastError.message, 
      attempts: maxRetries 
    };
  }
}

export const onosApiAlternative = new OnosApiAlternative();