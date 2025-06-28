
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConnectionStatusProps {
  connectionStatus: 'unknown' | 'connected' | 'error';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionStatus }) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'error':
        return 'Erreur de connexion';
      default:
        return 'Non testé';
    }
  };

  if (connectionStatus === 'unknown') return null;

  return (
    <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-gray-50">
      {getStatusIcon()}
      <span className="text-sm">{getStatusText()}</span>
    </div>
  );
};
