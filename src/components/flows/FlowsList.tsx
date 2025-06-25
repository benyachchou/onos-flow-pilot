
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';
import { Search, Loader2, MoreHorizontal, Eye, Trash2, Edit, Play, Pause } from 'lucide-react';

export const FlowsList = () => {
  const [deviceId, setDeviceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: flowsData, isLoading, refetch } = useQuery({
    queryKey: ['flows', deviceId],
    queryFn: () => onosApi.getFlows(deviceId || undefined),
    enabled: true,
    refetchInterval: 5000
  });

  const { data: devicesData } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    enabled: true
  });

  const { data: hostsData } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    enabled: true
  });

  const flows = flowsData?.flows || [];
  const devices = devicesData?.devices || [];
  const hosts = hostsData?.hosts || [];
  
  const filteredFlows = flows.filter((flow: any) =>
    flow.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeviceAction = (action: string, deviceId: string) => {
    console.log(`Action ${action} on device ${deviceId}`);
    // Ici vous pouvez ajouter la logique pour chaque action
  };

  const handleHostAction = (action: string, hostId: string) => {
    console.log(`Action ${action} on host ${hostId}`);
    // Ici vous pouvez ajouter la logique pour chaque action
  };

  const DeviceDropdown = ({ device }: { device: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
        <DropdownMenuItem onClick={() => handleDeviceAction('view', device.id)}>
          <Eye className="mr-2 h-4 w-4" />
          Voir détails
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeviceAction('flows', device.id)}>
          <Play className="mr-2 h-4 w-4" />
          Voir flux
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeviceAction('ports', device.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Voir ports
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeviceAction('disable', device.id)}>
          <Pause className="mr-2 h-4 w-4" />
          Désactiver
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const HostDropdown = ({ host }: { host: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
        <DropdownMenuItem onClick={() => handleHostAction('view', host.id)}>
          <Eye className="mr-2 h-4 w-4" />
          Voir détails
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleHostAction('locate', host.id)}>
          <Search className="mr-2 h-4 w-4" />
          Localiser
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleHostAction('remove', host.id)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      {/* Section Flux OpenFlow */}
      <Card>
        <CardHeader>
          <CardTitle>Flux OpenFlow ({filteredFlows.length})</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="ID de l'appareil (optionnel)"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un flux..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => refetch()}>
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des flux...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID du Flux</TableHead>
                    <TableHead>Appareil</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Sélecteur</TableHead>
                    <TableHead>Traitement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlows.map((flow: any) => (
                    <TableRow key={flow.id}>
                      <TableCell className="font-mono text-xs">{flow.id}</TableCell>
                      <TableCell className="font-mono text-xs">{flow.deviceId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{flow.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{flow.tableId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={flow.state === 'ADDED' ? 'default' : 'secondary'}>
                          {flow.state}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <pre className="text-xs bg-gray-100 p-1 rounded text-wrap overflow-hidden">
                            {JSON.stringify(flow.selector, null, 1)}
                          </pre>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <pre className="text-xs bg-gray-100 p-1 rounded text-wrap overflow-hidden">
                            {JSON.stringify(flow.treatment, null, 1)}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Appareils */}
      <Card>
        <CardHeader>
          <CardTitle>Appareils ({devices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de l'appareil</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device: any) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-mono text-xs">{device.id}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>
                      <Badge variant={device.available ? 'default' : 'destructive'}>
                        {device.available ? 'Oui' : 'Non'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <DeviceDropdown device={device} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section Hôtes */}
      <Card>
        <CardHeader>
          <CardTitle>Hôtes ({hosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de l'hôte</TableHead>
                  <TableHead>Adresse MAC</TableHead>
                  <TableHead>VLAN</TableHead>
                  <TableHead>Point de connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hosts.map((host: any) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-mono text-xs">{host.id}</TableCell>
                    <TableCell className="font-mono text-xs">{host.mac}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{host.vlan || 'None'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {host.locations?.[0]?.elementId}/{host.locations?.[0]?.port}
                    </TableCell>
                    <TableCell>
                      <HostDropdown host={host} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
