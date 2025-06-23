
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const TopologyViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);

  const { data: devices = { devices: [] } } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 5000
  });

  const { data: links = { links: [] } } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 5000
  });

  const { data: hosts = { hosts: [] } } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 5000
  });

  useEffect(() => {
    if (containerRef.current && devices.devices && links.links && hosts.hosts) {
      renderTopology();
    }
  }, [devices, links, hosts]);

  const renderTopology = () => {
    if (!containerRef.current) return;

    const nodes: any[] = [];
    const edges: any[] = [];

    // Ajouter les switches
    devices.devices.forEach((device: any) => {
      nodes.push({
        id: device.id,
        label: device.id.split(':')[1] || device.id,
        color: device.available ? '#3B82F6' : '#EF4444',
        shape: 'box',
        size: 30
      });
    });

    // Ajouter les hôtes
    hosts.hosts.forEach((host: any) => {
      nodes.push({
        id: host.id,
        label: host.mac || host.id,
        color: '#10B981',
        shape: 'dot',
        size: 20
      });

      // Connecter les hôtes aux switches
      if (host.locations && host.locations.length > 0) {
        host.locations.forEach((location: any) => {
          edges.push({
            from: host.id,
            to: location.elementId,
            color: '#10B981',
            width: 2
          });
        });
      }
    });

    // Ajouter les liens entre switches
    links.links.forEach((link: any) => {
      edges.push({
        from: link.src.device,
        to: link.dst.device,
        color: '#6B7280',
        width: 3,
        label: `${link.src.port}→${link.dst.port}`
      });
    });

    // Utiliser une représentation simple avec div au lieu de vis.js
    containerRef.current.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full">
        <div class="text-lg font-semibold mb-4">Topologie du Réseau</div>
        <div class="grid grid-cols-2 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
              <span class="text-white font-bold">${devices.devices.length}</span>
            </div>
            <p class="text-sm text-gray-600">Switches</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <span class="text-white font-bold">${hosts.hosts.length}</span>
            </div>
            <p class="text-sm text-gray-600">Hosts</p>
          </div>
        </div>
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-500">${links.links.length} liens actifs</p>
        </div>
      </div>
    `;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Visualisation de la Topologie
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full h-96 border rounded-lg bg-gray-50 flex items-center justify-center"
        >
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Chargement de la topologie...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
