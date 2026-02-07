import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Building, Users, Wrench, Settings, LogOut, FileText, Bell, MessageSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider'; // Assuming you have a theme provider

interface SidebarProps {
  user: User;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onNavigate, onLogout }) => {
    const { theme, setTheme } = useTheme();

    const baseNavItems = [
        // { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    const tenantNavItems = [
        ...baseNavItems,
        { id: 'properties', icon: Building, label: 'My Home' },
        { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
        { id: 'applications', icon: FileText, label: 'Applications' },
    ];

    const agentNavItems = [
        ...baseNavItems,
        { id: 'properties', icon: Building, label: 'Properties' },
        { id: 'tenants', icon: Users, label: 'Tenants' },
        { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
        { id: 'applications', icon: FileText, label: 'Applications' },
    ];

    const navItems = user.role === UserRole.TENANT ? tenantNavItems : agentNavItems;

  return (
    <div className="flex flex-col w-72 bg-offwhite dark:bg-black border-r border-zinc-200 dark:border-zinc-800">
        <div className="p-6 flex items-center gap-3 font-black text-4xl tracking-tighter text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800">
          spaceya
        </div>

        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src={user.avatar || '/user-placeholder.png'} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><Bell size={18}/></button>
                <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><MessageSquare size={18}/></button>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase px-3 pb-2">Menu</p>
            {navItems.map(item => (
            <button 
                key={item.id} 
                onClick={() => onNavigate(item.id)} 
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors text-zinc-600 dark:text-zinc-400 ${
                activeView === item.id 
                ? 'bg-blue-600 text-white dark:text-white' 
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}>
                <item.icon size={20} />
                <span>{item.label}</span>
            </button>
            ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button onClick={() => onNavigate('settings')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold transition-colors text-zinc-600 dark:text-zinc-400 ${
                activeView === 'settings' 
                ? 'bg-zinc-200 dark:bg-zinc-800' 
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}>
                <Settings size={20}/>
                <span>Settings</span>
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-left font-semibold text-red-500 hover:bg-red-500/10 mt-1">
                <LogOut size={20}/>
                <span>Logout</span>
            </button>
        </div>

         <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-500">&copy; 2024 Spaceya Inc.</p>
            <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-full p-1">
                <button onClick={() => setTheme('light')} className={`p-1 rounded-full ${theme === 'light' ? 'bg-white dark:bg-zinc-700' : ''}`}><Sun size={14}/></button>
                <button onClick={() => setTheme('dark')} className={`p-1 rounded-full ${theme === 'dark' ? 'bg-white dark:bg-zinc-700' : ''}`}><Moon size={14}/></button>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;
