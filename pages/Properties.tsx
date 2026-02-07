import React, { useState, useMemo } from 'react';
import { getStore, saveProperty } from '../store';
import { User, UserRole, Property } from '../types';
import { Search, MapPin, PlusCircle, Home, Users, DollarSign, Edit, Trash2 } from 'lucide-react';

interface PropertiesProps {
    user: User;
    onUpdate: () => void;
}

const Properties: React.FC<PropertiesProps> = ({ user, onUpdate }) => {
    const [store, setStore] = useState(getStore());
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProperty, setNewProperty] = useState({ name: '', address: '', rent: '' });

    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user.role !== UserRole.AGENT) return; 

        const propertyData: Omit<Property, 'id' | 'displayId'> = {
            name: newProperty.name,
            address: newProperty.address,
            rent: parseFloat(newProperty.rent),
            agentId: user.id,
            tenantId: null, // No tenant initially
        };

        await saveProperty(propertyData);
        setShowAddForm(false);
        setNewProperty({ name: '', address: '', rent: '' });
        // Manually update the store for now
        onUpdate();
        setStore(getStore());
    };

    const userProperties = useMemo(() => {
        let properties = user.role === UserRole.AGENT
            ? store.properties.filter(p => p.agentId === user.id)
            : store.properties.filter(p => 
                store.applications.some(a => a.userId === user.id && a.propertyId === p.id && a.status === 'approved')
            );
        
        if (!searchTerm) return properties;

        return properties.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [store, user, searchTerm]);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Properties</h1>
                {user.role === UserRole.AGENT && (
                    <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                        <PlusCircle size={16}/>
                        <span>Add Property</span>
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Add New Property</h2>
                    <form onSubmit={handleAddProperty} className="space-y-4">
                        <input type="text" placeholder="Property Name" value={newProperty.name} onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3" required />
                        <input type="text" placeholder="Address" value={newProperty.address} onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3" required />
                        <input type="number" placeholder="Monthly Rent" value={newProperty.rent} onChange={(e) => setNewProperty({ ...newProperty, rent: e.target.value })} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3" required />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Add Property</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search properties..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProperties.map(property => {
                        const tenant = store.users.find(u => 
                            store.applications.some(a => a.propertyId === property.id && a.userId === u.id && a.status === 'approved')
                        );
                        return (
                            <div key={property.id} className="bg-offwhite dark:bg-black rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                                <div>
                                    <img src={`https://source.unsplash.com/random/400x300?house,modern,${property.id}`} className="rounded-lg w-full h-40 object-cover mb-4"/>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{property.name}</h3>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2"><MapPin size={12}/> {property.address}</p>
                                
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-green-500"/>
                                            <span className="font-bold text-lg">${property.rent.toLocaleString()}</span>
                                            <span className="text-xs text-zinc-500">/month</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            <Users size={16}/>
                                            <span>{tenant ? tenant.name.split(' ')[0] : 'Vacant'}</span>
                                        </div>
                                    </div>
                                </div>
                                {user.role === UserRole.AGENT && (
                                    <div className="flex gap-2 mt-4">
                                        <button className="flex-1 text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-white py-2 rounded-md flex items-center justify-center gap-1"><Edit size={12}/> Edit</button>
                                        <button className="flex-1 text-xs font-bold bg-red-500/10 text-red-500 py-2 rounded-md flex items-center justify-center gap-1"><Trash2 size={12}/> Delete</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Properties;
