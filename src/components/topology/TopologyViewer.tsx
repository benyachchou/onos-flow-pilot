
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { RefreshCw, Loader2, Network, Router, Users, Server } from 'lucide-react';
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

    // Ajouter le contrôleur ONOS au centre
    nodes.push({
      id: 'onos-controller',
      label: 'ONOS\nController',
      color: {
        background: '#8B5CF6',
        border: '#7C3AED',
        highlight: {
          background: '#A78BFA',
          border: '#7C3AED'
        }
      },
      shape: 'diamond',
      size: 40,
      font: { color: 'white', size: 14, face: 'Arial Black' },
      title: 'ONOS SDN Controller\nCentralized Network Control',
      physics: false,
      x: 0,
      y: -200
    });

    // Ajouter les switches/devices avec une meilleure organisation
    devices.devices.forEach((device: any, index: number) => {
      const angle = (index * 2 * Math.PI) / devices.devices.length;
      const radius = 150;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      nodes.push({
        id: device.id,
        label: `SW-${device.id.split(':')[1]?.substring(0, 4) || device.id.substring(0, 8)}`,
        color: {
          background: device.available ? '#3B82F6' : '#EF4444',
          border: '#1E40AF',
          highlight: {
            background: device.available ? '#60A5FA' : '#F87171',
            border: '#1E40AF'
          }
        },
        shape: 'box',
        size: 30,
        font: { color: 'white', size: 12, face: 'Arial Bold' },
        title: `Switch: ${device.id}\nType: ${device.type}\nStatus: ${device.available ? 'Online' : 'Offline'}\nDriver: ${device.driver}\nManufacturer: ${device.mfr || 'Unknown'}`,
        physics: false,
        x: x,
        y: y
      });

      // Connexion de contrôle entre ONOS et chaque switch
      edges.push({
        id: `control-${device.id}`,
        from: 'onos-controller',
        to: device.id,
        color: {
          color: '#8B5CF6',
          highlight: '#A78BFA'
        },
        width: 2,
        dashes: [5, 5],
        title: `Control Channel: ONOS → ${device.id}`,
        font: { size: 10 },
        smooth: {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.1
        }
      });
    });

    // Ajouter les hôtes autour des switches
    hosts.hosts.forEach((host: any, index: number) => {
      let hostX = 0, hostY = 0;
      
      // Positionner les hôtes autour de leur switch parent
      if (host.locations && host.locations.length > 0) {
        const parentSwitch = nodes.find(n => n.id === host.locations[0].elementId);
        if (parentSwitch) {
          const hostAngle = (index * 2 * Math.PI) / hosts.hosts.length;
          const hostRadius = 80;
          hostX = parentSwitch.x + Math.cos(hostAngle) * hostRadius;
          hostY = parentSwitch.y + Math.sin(hostAngle) * hostRadius;
        }
      }

      nodes.push({
        id: host.id,
        label: `Host\n${host.mac ? host.mac.substring(9, 17) : host.id.substring(0, 8)}`,
        color: {
          background: '#10B981',
          border: '#059669',
          highlight: {
            background: '#34D399',
            border: '#059669'
          }
        },
        shape: 'dot',
        size: 20,
        font: { color: 'white', size: 10, face: 'Arial' },
        title: `Host: ${host.id}\nMAC: ${host.mac}\nIP: ${host.ipAddresses?.join(', ') || 'N/A'}\nVLAN: ${host.vlan || 'None'}\nLocation: ${host.locations?.[0]?.elementId || 'Unknown'}`,
        physics: false,
        x: hostX,
        y: hostY
      });

      // Connecter les hôtes aux switches avec des câbles réalistes
      if (host.locations && host.locations.length > 0) {
        host.locations.forEach((location: any) => {
          edges.push({
            id: `host-${host.id}-${location.elementId}`,
            from: host.id,
            to: location.elementId,
            color: { 
              color: '#10B981', 
              highlight: '#34D399' 
            },
            width: 3,
            title: `Physical Connection\nHost ${host.mac} ↔ Switch ${location.elementId}\nPort: ${location.port}`,
            smooth: {
              enabled: true,
              type: 'continuous'
            }
          });
        });
      }
    });

    // Ajouter les liens entre switches avec des informations détaillées
    links.links.forEach((link: any, index: number) => {
      edges.push({
        id: `link-${index}`,
        from: link.src.device,
        to: link.dst.device,
        color: {
          color: link.state === 'ACTIVE' ? '#374151' : '#EF4444',
          highlight: '#6B7280'
        },
        width: link.state === 'ACTIVE' ? 4 : 2,
        title: `Inter-Switch Link\n${link.src.device}:${link.src.port} ↔ ${link.dst.device}:${link.dst.port}\nState: ${link.state}\nType: ${link.type}\nBandwidth: ${link.annotations?.bandwidth || 'Unknown'}`,
        label: `${link.src.port}↔${link.dst.port}`,
        font: { size: 8, align: 'middle', color: '#374151' },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.3
        }
      });
    });

    // Configuration avancée du réseau vis.js
    const data = { nodes, edges };
    const options = {
      physics: {
        enabled: false,
        stabilization: false
      },
      layout: {
        improvedLayout: false,
        hierarchical: false
      },
      interaction: {
        hover: true,
        selectConnectedEdges: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true
      },
      nodes: {
        borderWidth: 3,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 10,
          x: 3,
          y: 3
        },
        font: {
          color: 'white',
          size: 12,
          face: 'Arial'
        }
      },
      edges: {
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: 5,
          x: 2,
          y: 2
        },
        smooth: {
          enabled: true,
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
        console.log('Network element selected:', nodeId);
        
        if (nodeId === 'onos-controller') {
          console.log('ONOS Controller selected - Central SDN control point');
        } else if (nodes.find(n => n.id === nodeId && n.shape === 'box')) {
          console.log('Switch selected:', nodeId);
        } else if (nodes.find(n => n.id === nodeId && n.shape === 'dot')) {
          console.log('Host selected:', nodeId);
        }
      }
    });

    // Fit the network to show all elements
    networkRef.current.fit({
      animation: true
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
          <span>Chargement de la topologie réseau...</span>
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
            Topologie Réseau SDN - ONOS
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistiques détaillées */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border">
            <Server className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Contrôleur</p>
              <p className="font-bold text-purple-700">ONOS SDN</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
            <Router className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Switches</p>
              <p className="font-bold text-blue-700">{networkStats.devices}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Hosts</p>
              <p className="font-bold text-green-700">{networkStats.hosts}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <Network className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Liens</p>
              <p className="font-bold text-gray-700">{networkStats.links}</p>
            </div>
          </div>
        </div>

        {/* Visualisation de la topologie */}
        <div
          ref={containerRef}
          className="w-full h-96 border-2 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100"
          style={{ height: '500px' }}
        />

        {/* Légende améliorée */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
            <div className="w-6 h-6 bg-purple-500 rounded" style={{ clipPath: 'polygon(50% 0%, 0% 50%, 50% 100%, 100% 50%)' }}></div>
            <span className="font-medium">Contrôleur ONOS</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <div className="w-6 h-4 bg-blue-500 rounded"></div>
            <span className="font-medium">Switch Online</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span className="font-medium">Host/Terminal</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-gray-600"></div>
              <div className="w-4 h-0.5 bg-purple-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
            </div>
            <span className="font-medium">Liens Physiques/Contrôle</span>
          </div>
        </div>

        {/* Informations sur l'architecture */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Architecture SDN:</strong> Le contrôleur ONOS gère centralement tous les switches via le protocole OpenFlow. 
            Les lignes pointillées représentent les canaux de contrôle, les lignes pleines les connexions de données.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
