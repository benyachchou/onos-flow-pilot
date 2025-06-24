
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { RefreshCw, Loader2, Network, Router, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Network as VisNetwork } from 'vis-network';

export const TopologyViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<VisNetwork | null>(null);
  const [networkStats, setNetworkStats] = useState({ devices: 0, hosts: 0, links: 0 });

  const { data: devices = { devices: [] }, refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 5000
  });

  const { data: links = { links: [] }, refetch: refetchLinks } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 5000
  });

  const { data: hosts = { hosts: [] }, refetch: refetchHosts } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 5000
  });

  useEffect(() => {
    if (containerRef.current && devices.devices && links.links && hosts.hosts) {
      renderTopology();
      setNetworkStats({
        devices: devices.devices.length,
        hosts: hosts.hosts.length,
        links: links.links.length
      });
    }
  }, [devices, links, hosts]);

  const renderTopology = () => {
    if (!containerRef.current) return;

    const nodes: any[] = [];
    const edges: any[] = [];

    // Ajouter les switches/devices
    devices.devices.forEach((device: any) => {
      nodes.push({
        id: device.id,
        label: device.id.split(':')[1] || device.id.substring(0, 12),
        color: {
          background: device.available ? '#3B82F6' : '#EF4444',
          border: '#1E40AF',
          highlight: {
            background: device.available ? '#60A5FA' : '#F87171',
            border: '#1E40AF'
          }
        },
        shape: 'box',
        size: 25,
        font: { color: 'white', size: 12 },
        title: `Device: ${device.id}\nType: ${device.type}\nStatus: ${device.available ? 'Online' : 'Offline'}\nDriver: ${device.driver}`
      });
    });

    // Ajouter les hôtes
    hosts.hosts.forEach((host: any) => {
      nodes.push({
        id: host.id,
        label: host.mac ? host.mac.substring(0, 8) : host.id.substring(0, 8),
        color: {
          background: '#10B981',
          border: '#059669',
          highlight: {
            background: '#34D399',
            border: '#059669'
          }
        },
        shape: 'dot',
        size: 15,
        font: { color: 'white', size: 10 },
        title: `Host: ${host.id}\nMAC: ${host.mac}\nIP: ${host.ipAddresses?.join(', ') || 'N/A'}\nVLAN: ${host.vlan || 'None'}`
      });

      // Connecter les hôtes aux switches
      if (host.locations && host.locations.length > 0) {
        host.locations.forEach((location: any) => {
          edges.push({
            from: host.id,
            to: location.elementId,
            color: { color: '#10B981', highlight: '#34D399' },
            width: 2,
            title: `Host ${host.mac} connected to ${location.elementId} on port ${location.port}`
          });
        });
      }
    });

    // Ajouter les liens entre switches
    links.links.forEach((link: any, index: number) => {
      edges.push({
        id: `link-${index}`,
        from: link.src.device,
        to: link.dst.device,
        color: {
          color: link.state === 'ACTIVE' ? '#6B7280' : '#EF4444',
          highlight: '#374151'
        },
        width: link.state === 'ACTIVE' ? 3 : 1,
        title: `Link: ${link.src.device}:${link.src.port} → ${link.dst.device}:${link.dst.port}\nState: ${link.state}\nType: ${link.type}`,
        label: `${link.src.port}→${link.dst.port}`,
        font: { size: 8, align: 'middle' }
      });
    });

    // Configuration du réseau vis.js
    const data = { nodes, edges };
    const options = {
      physics: {
        enabled: true,
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -8000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09
        }
      },
      layout: {
        improvedLayout: true,
        hierarchical: false
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
        tooltipDelay: 200
      },
      nodes: {
        borderWidth: 2,
        shadow: true,
        font: {
          color: 'white',
          size: 12,
          face: 'arial'
        }
      },
      edges: {
        shadow: true,
        smooth: {
          type: 'continuous',
          roundness: 0.2
        }
      }
    };

    // Créer ou mettre à jour le réseau
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    networkRef.current = new VisNetwork(containerRef.current, data, options);

    // Événements du réseau
    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        console.log('Node clicked:', nodeId);
      }
    });
  };

  const handleRefresh = () => {
    refetchDevices();
    refetchLinks();
    refetchHosts();
  };

  if (!devices.devices || !links.links || !hosts.hosts) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement de la topologie...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Topologie du Réseau
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Router className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Devices</p>
              <p className="font-semibold text-blue-600">{networkStats.devices}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Hosts</p>
              <p className="font-semibold text-green-600">{networkStats.hosts}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Network className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Links</p>
              <p className="font-semibold text-gray-600">{networkStats.links}</p>
            </div>
          </div>
        </div>

        {/* Visualisation de la topologie */}
        <div
          ref={containerRef}
          className="w-full h-96 border rounded-lg bg-white"
          style={{ height: '400px' }}
        />

        {/* Légende */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Switch/Device Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Switch/Device Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Host</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-500"></div>
            <span>Link Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
