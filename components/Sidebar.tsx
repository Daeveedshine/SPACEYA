import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Building, Users, FileText, CreditCard, Wrench, FilePlus, Bell, Globe, UserCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  user: User;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onNavigate, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const agentNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'properties', icon: Building, label: 'Properties' },
    { id: 'tenants', icon: Users, label: 'Tenants' },
    { id: 'agreements', icon: FileText, label: 'Agreements' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
    { id: 'applications', icon: FilePlus, label: 'Applications' },
  ];

  const tenantNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'agreements', icon: FileText, label: 'My Lease' },
    { id: 'payments', icon: CreditCard, label: 'My Payments' },
    { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
  ];

  const navItems = user.role === UserRole.AGENT ? agentNavItems : tenantNavItems;

  return (
    <div className={`flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 h-20 border-b border-zinc-200 dark:border-zinc-800`}>
        {!isCollapsed && <span className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white">spaceya</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => onNavigate(item.id)} 
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors ${isCollapsed ? 'justify-center' : ''} ${
              activeView === item.id 
              ? 'bg-blue-600 text-white' 
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}>
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button onClick={() => onNavigate('settings')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors ${isCollapsed ? 'justify-center' : ''} ${activeView === 'settings' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
             <UserCircle size={20}/>
             {!isCollapsed && <span>My Profile</span>}
          </button>
          <button onClick={onLogout} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold text-zinc-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={20}/>
            {!isCollapsed && <span>Logout</span>}
          </button>
      </div>

       <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
           <img src={user.avatar || '/user-placeholder.png'} alt="User Avatar" className={`w-10 h-10 rounded-full object-cover transition-all ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`} />
           {!isCollapsed && <div>
                <p className="font-bold text-sm text-zinc-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
            </div>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
