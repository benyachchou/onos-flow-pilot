
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Network, Activity, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { onosApi } from '@/services/onosApi';

export const MetricsCards = () => {
  const { data: devices = { devices: [] } } = useQuery({
    queryKey: ['devices'],
    queryFn: () => onosApi.getDevices(),
    refetchInterval: 3000
  });

  const { data: hosts = { hosts: [] } } = useQuery({
    queryKey: ['hosts'],
    queryFn: () => onosApi.getHosts(),
    refetchInterval: 3000
  });

  const { data: links = { links: [] } } = useQuery({
    queryKey: ['links'],
    queryFn: () => onosApi.getLinks(),
    refetchInterval: 3000
  });

  const { data: flows = { flows: [] } } = useQuery({
    queryKey: ['flows'],
    queryFn: () => onosApi.getFlows(),
    refetchInterval: 3000
  });

  const metrics = [
    {
      title: 'Switches',
      value: devices.devices?.length || 0,
      icon: Server,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Hosts',
      value: hosts.hosts?.length || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Links',
      value: links.links?.length || 0,
      icon: Network,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Flows',
      value: flows.flows?.length || 0,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
