
import React from 'react';
import { Database } from 'lucide-react';

interface DatabaseStatusProps {
  isInitialized: boolean;
  dbError: string | null;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ isInitialized, dbError }) => {
  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Database className="h-5 w-5 text-green-600" />
        <div>
          <h3 className="text-green-800 font-medium">Base de données SQLite</h3>
          <p className="text-green-700 text-sm">
            {isInitialized ? 'Base de données initialisée avec succès' : 'Initialisation en cours...'}
            {dbError && ` - Erreur: ${dbError}`}
          </p>
        </div>
      </div>
    </div>
  );
};
