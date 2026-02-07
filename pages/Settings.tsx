import React, { useState } from 'react';
import { User } from '../types';
import { getStore, saveStore } from '../store';
import { User as UserIcon, Bell, Shield, Palette, Save } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
  const [store, setStore] = useState(getStore());
  const [activeTab, setActiveTab] = useState('profile');

  // Local state for form inputs
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [theme, setTheme] = useState(store.theme);

  const handleSave = () => {
    // Create updated user object
    const updatedUser = { ...user, name, email };
    
    // Update user in the users array
    const updatedUsers = store.users.map(u => u.id === user.id ? updatedUser : u);

    // Create the new state
    const newState = { 
      ...store, 
      users: updatedUsers, 
      currentUser: updatedUser, // Also update currentUser
      theme: theme
    };

    saveStore(newState);
    onUpdate();
    // Add toast notification for success
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Public Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-3 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-3 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg" />
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Notifications</h2>
            <p className="text-zinc-500">Manage your notification settings here. (UI Placeholder)</p>
          </div>
        );
      case 'appearance':
         return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Appearance</h2>
             <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value as 'light' | 'dark')} className="w-full mt-1 p-3 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg appearance-none">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-8">Settings</h1>
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/4">
                <nav className="flex flex-col space-y-2">
                    <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 p-3 rounded-lg text-left font-semibold ${activeTab === 'profile' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <UserIcon size={20} /> Profile
                    </button>
                     <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 p-3 rounded-lg text-left font-semibold ${activeTab === 'notifications' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <Bell size={20} /> Notifications
                    </button>
                     <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-3 p-3 rounded-lg text-left font-semibold ${activeTab === 'appearance' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <Palette size={20} /> Appearance
                    </button>
                </nav>
            </aside>
            <main className="flex-1">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg">
                    {renderContent()}
                     <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                        <button onClick={handleSave} className="bg-blue-600 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                            <Save size={16}/>
                            Save Changes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
};

export default Settings;
