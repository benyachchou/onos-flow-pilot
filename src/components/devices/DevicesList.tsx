
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { CheckCircle, XCircle, Loader2, Search, Router, Users, Network, Shuffle } from 'lucide-react';

export const DevicesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: devicesData, isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 3000
  });

  const { data: hostsData, isLoading: hostsLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 3000
  });

  const { data: linksData, isLoading: linksLoading } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 3000
  });

  if (devicesLoading || hostsLoading || linksLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des données réseau...</span>
        </CardContent>
      </Card>
    );
  }

  if (devicesError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-red-500">
          <XCircle className="h-8 w-8 mr-2" />
          Erreur lors du chargement des données réseau
        </CardContent>
      </Card>
    );
  }

  const devices = devicesData?.devices || [];
  const hosts = hostsData?.hosts || [];
  const links = linksData?.links || [];

  // Préparer tous les éléments avec leurs types
  const allItems = [
    ...devices.map((device: any) => ({
      ...device,
      itemType: 'device',
      displayType: device.type === 'SWITCH' ? 'Switch' : 'Device',
      icon: Router,
      searchableText: `${device.id} ${device.type} ${device.driver} ${device.manufacturer || ''}`
    })),
    ...hosts.map((host: any) => ({
      ...host,
      itemType: 'host',
      displayType: 'Host',
      icon: Users,
      searchableText: `${host.id} ${host.mac} ${host.ipAddresses?.join(' ') || ''} ${host.location?.elementId || ''}`
    })),
    ...links.map((link: any) => ({
      ...link,
      itemType: 'link',
      displayType: 'Link',
      icon: Network,
      searchableText: `${link.src?.device || ''} ${link.dst?.device || ''} ${link.type || ''} ${link.state || ''}`
    }))
  ];

  // Filtrer par type
  const filteredByType = allItems.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'switches') return item.itemType === 'device' && item.type === 'SWITCH';
    return item.itemType === filterType;
  });

  // Filtrer par terme de recherche
  const filteredItems = filteredByType.filter(item =>
    item.searchableText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (item: any) => {
    switch (item.itemType) {
      case 'device':
        return {
          status: item.available,
          statusText: item.available ? "En ligne" : "Hors ligne",
          secondaryInfo: `Rôle: ${item.role || "MASTER"}`
        };
      case 'host':
        return {
          status: true, // Les hosts retournés sont généralement actifs
          statusText: "Connecté",
          secondaryInfo: `VLAN: ${item.vlan || 'None'}`
        };
      case 'link':
        return {
          status: item.state === 'ACTIVE',
          statusText: item.state || 'UNKNOWN',
          secondaryInfo: `Type: ${item.type || 'DIRECT'}`
        };
      default:
        return { status: false, statusText: 'Inconnu', secondaryInfo: '' };
    }
  };

  const renderItemDetails = (item: any) => {
    const Icon = item.icon;
    const statusInfo = getStatusInfo(item);

    switch (item.itemType) {
      case 'device':
        return (
          <div>
            <h3 className="font-medium">{item.id}</h3>
            <p className="text-sm text-gray-500">
              Type: {item.type} | Driver: {item.driver}
              {item.manufacturer && ` | ${item.manufacturer}`}
            </p>
          </div>
        );
      case 'host':
        return (
          <div>
            <h3 className="font-medium">{item.id}</h3>
            <p className="text-sm text-gray-500">
              MAC: {item.mac} | IP: {item.ipAddresses?.join(', ') || 'N/A'}
            </p>
            <p className="text-xs text-gray-400">
              Connecté à: {item.location?.elementId}:{item.location?.port}
            </p>
          </div>
        );
      case 'link':
        return (
          <div>
            <h3 className="font-medium">
              {item.src?.device} → {item.dst?.device}
            </h3>
            <p className="text-sm text-gray-500">
              Port {item.src?.port} → Port {item.dst?.port}
            </p>
          </div>
        );
      default:
        return <div>Élément inconnu</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion du Réseau ({filteredItems.length})
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Éléments du Réseau</span>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher devices, hosts, links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les éléments</SelectItem>
                  <SelectItem value="device">Devices</SelectItem>
                  <SelectItem value="switches">Switches</SelectItem>
                  <SelectItem value="host">Hosts</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Aucun élément trouvé avec ces critères' 
                : 'Aucun élément réseau disponible'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const statusInfo = getStatusInfo(item);
                
                return (
                  <div
                    key={`${item.itemType}-${index}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-2 text-gray-600" />
                        {statusInfo.status ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {renderItemDetails(item)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {item.displayType}
                      </Badge>
                      <Badge variant={statusInfo.status ? "default" : "destructive"}>
                        {statusInfo.statusText}
                      </Badge>
                      {statusInfo.secondaryInfo && (
                        <Badge variant="outline">
                          {statusInfo.secondaryInfo}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Router className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Devices</p>
                <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shuffle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Switches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter((d: any) => d.type === 'SWITCH').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Hosts</p>
                <p className="text-2xl font-bold text-gray-900">{hosts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Links</p>
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
