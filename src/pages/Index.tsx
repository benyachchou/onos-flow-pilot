
import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { DevicesList } from '@/components/devices/DevicesList';
import { TopologyViewer } from '@/components/topology/TopologyViewer';
import { FlowsList } from '@/components/flows/FlowsList';
import { PostmanInterface } from '@/components/api/PostmanInterface';
import { Settings } from '@/components/settings/Settings';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Tableau de bord ONOS
            </h1>
            <MetricsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Aperçu de la topologie</h2>
                <TopologyViewer />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Derniers flux</h2>
                <FlowsList />
              </div>
            </div>
          </div>
        );
      case 'devices':
        return <DevicesList />;
      case 'topology':
        return <TopologyViewer />;
      case 'flows':
        return <FlowsList />;
      case 'api':
        return <PostmanInterface />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Tableau de bord ONOS
            </h1>
            <MetricsCards />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 ml-64">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
