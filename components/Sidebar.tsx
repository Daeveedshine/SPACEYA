import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, LayoutDashboard, Building2, Users, Handshake, CreditCard, Wrench, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  user: User;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onNavigate, onLogout }) => {
  const getNavLinks = () => {
    const baseLinks = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'properties', label: 'Properties', icon: Building2 },
      { id: 'agreements', label: 'Agreements', icon: Handshake },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'applications', label: 'Applications', icon: FileText },
    ];

    if (user.role === UserRole.ADMIN) {
      return [
        ...baseLinks,
        { id: 'tenants', label: 'Tenants', icon: Users },
        { id: 'agents', label: 'Agents', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (user.role === UserRole.AGENT) {
        return [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'properties', label: 'Properties', icon: Building2 },
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'applications', label: 'Applications', icon: FileText },
        ];
    }

    // Tenant
    return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'agreements', label: 'My Agreements', icon: Handshake },
        { id: 'payments', label: 'My Payments', icon: CreditCard },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    ];
  };

  return (
    <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col justify-between">
        <div>
            <div className="p-6">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Spaceya</h1>
            </div>
            <nav className="p-4">
                {getNavLinks().map(({ id, label, icon: Icon }) => (
                    <button 
                        key={id} 
                        onClick={() => onNavigate(id)} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeView === id ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <Icon size={20} />
                        {label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
             <div className="flex items-center gap-3 mb-4">
                <img src={user.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'} alt={user.name} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.role}</p>
                </div>
             </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                <LogOut size={20} />
                Logout
            </button>
        </div>
    </div>
  );
};

export default Sidebar;
