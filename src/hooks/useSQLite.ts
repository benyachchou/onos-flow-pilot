
import { useState, useEffect } from 'react';
import { sqliteService } from '@/services/sqliteService';

export const useSQLite = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await sqliteService.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    };

    initializeDatabase();

    return () => {
      sqliteService.close();
    };
  }, []);

  const saveOnosConfig = async (config: {
    ip: string;
    port: string;
    username: string;
    password: string;
  }) => {
    try {
      await sqliteService.saveOnosConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config');
    }
  };

  const getLatestOnosConfig = async () => {
    try {
      return await sqliteService.getLatestOnosConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get config');
      return null;
    }
  };

  const saveApiRequest = async (request: any) => {
    try {
      await sqliteService.saveApiRequest(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save request');
    }
  };

  const getAllApiRequests = async () => {
    try {
      return await sqliteService.getAllApiRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get requests');
      return [];
    }
  };

  const deleteApiRequest = async (id: string) => {
    try {
      await sqliteService.deleteApiRequest(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete request');
    }
  };

  return {
    isInitialized,
    error,
    saveOnosConfig,
    getLatestOnosConfig,
    saveApiRequest,
    getAllApiRequests,
    deleteApiRequest
  };
};
