import React, { useMemo, useState } from 'react';
import { getStore } from '../store';
import { User, UserRole } from '../types';
import { Search, Mail, Phone, Home, MessageSquare, PlusCircle } from 'lucide-react';

interface TenantsProps {
    user: User;
    onUpdate: () => void;
}

const Tenants: React.FC<TenantsProps> = ({ user, onUpdate }) => {
    const [store, setStore] = useState(getStore());
    const [searchTerm, setSearchTerm] = useState('');

    const tenants = useMemo(() => {
        // Agents see tenants of properties they manage.
        // Tenants do not see this page.
        const agentProperties = store.properties.filter(p => p.agentId === user.id);
        const propertyIds = new Set(agentProperties.map(p => p.id));
        const tenantIds = new Set(
            store.applications
                .filter(a => propertyIds.has(a.propertyId))
                .map(a => a.userId)
        );

        const filteredTenants = store.users.filter(u => tenantIds.has(u.id));

        if (!searchTerm) return filteredTenants;

        return filteredTenants.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [store, user.id, searchTerm]);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Tenants</h1>
                <button className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                    <PlusCircle size={16}/>
                    <span>Add Tenant</span>
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search tenants by name or email..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenants.map(tenant => {
                        const property = store.properties.find(p => 
                            store.applications.some(a => a.userId === tenant.id && a.propertyId === p.id)
                        );
                        return (
                        <div key={tenant.id} className="bg-offwhite dark:bg-black rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={tenant.avatar || '/user-placeholder.png'} alt={tenant.name} className="w-16 h-16 rounded-full object-cover" />
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{tenant.name}</h3>
                                        <p className="text-sm text-zinc-500 flex items-center gap-2"><Home size={12}/>{property ? property.name : 'No property assigned'}</p>
                                    </div>
                                </div>
                                <button className='p-2 text-zinc-400 hover:text-blue-600'><MessageSquare size={16}/></button>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <p className="flex items-center gap-2"><Mail size={14}/> {tenant.email}</p>
                                <p className="flex items-center gap-2"><Phone size={14}/> (555) 123-4567</p>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
};

export default Tenants;
