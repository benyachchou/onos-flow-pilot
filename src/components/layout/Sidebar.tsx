
import { 
  Server, 
  Network, 
  Activity, 
  Code, 
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'devices', label: 'Appareils', icon: Server },
  { id: 'topology', label: 'Topologie', icon: Network },
  { id: 'flows', label: 'Flux OpenFlow', icon: Activity },
  { id: 'api', label: 'API Explorer', icon: Code },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const handleMenuClick = (viewId: string) => {
    console.log(`Navigating to: ${viewId}`);
    onViewChange(viewId);
    
    // Dispatch custom event for legacy compatibility
    window.dispatchEvent(new CustomEvent('menuClick', { 
      detail: { view: viewId } 
    }));
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          ONOS Manager
        </h1>
        <p className="text-sm text-slate-400 mt-1">SDN Controller</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start text-left ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => handleMenuClick(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
