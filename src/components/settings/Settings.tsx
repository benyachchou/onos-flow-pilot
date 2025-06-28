
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettingsLogic } from '@/hooks/useSettingsLogic';
import { ConfigurationForm } from './ConfigurationForm';
import { ConnectionStatus } from './ConnectionStatus';
import { ApplicationInfo } from './ApplicationInfo';
import { DatabaseStatus } from './DatabaseStatus';

export const Settings = () => {
  const {
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
  } = useSettingsLogic();

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="mr-3 h-8 w-8" />
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <DatabaseStatus isInitialized={isInitialized} dbError={dbError} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ConfigurationForm
            controllerIp={controllerIp}
            controllerPort={controllerPort}
            username={username}
            password={password}
            onIpChange={setControllerIp}
            onPortChange={setControllerPort}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSave={handleSaveConfig}
            onTestConnection={testConnection}
            testing={testing}
            isInitialized={isInitialized}
          />
          
          <ConnectionStatus connectionStatus={connectionStatus} />
        </div>

        <ApplicationInfo
          controllerIp={controllerIp}
          controllerPort={controllerPort}
          connectionStatus={connectionStatus}
          isInitialized={isInitialized}
        />
      </div>
    </div>
  );
};
