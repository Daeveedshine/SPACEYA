import React, { useState, useMemo } from "react";
import { Property, User } from "../types";
import { getStore } from "../store";
import { Search, Map, List, Plus, Edit, Trash2, X, MapPin, Building, Users, DollarSign, Bed, Bath, Car } from "lucide-react";

interface PropertiesProps {
  user: User;
  onUpdate?: () => void;
}

const Properties: React.FC<PropertiesProps> = ({ user, onUpdate }) => {
  const [store, setStore] = useState(getStore());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const properties = useMemo(() => 
    store.properties.filter(p => 
      p.agentId === user.id &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.address.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [store.properties, user.id, searchTerm]);

  const getTenantCount = (propertyId: string) => {
    return store.agreements.filter(a => a.propertyId === propertyId).length;
  };

  return (
    <div className="h-full flex flex-col xl:flex-row p-4 sm:p-6 md:p-8 gap-6 bg-offwhite dark:bg-black">
      <div className="flex-1 h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">My Properties</h1>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-zinc-100 dark:bg-black rounded-lg flex items-center">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><List size={16} /></button>
                <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-zinc-800 text-blue-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}><Map size={16} /></button>
            </div>
            <button className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                <Plus size={16} />
                Add Property
            </button>
          </div>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or address..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>
        {viewMode === 'list' ? (
           <div className="flex-1 overflow-y-auto -mx-6">
            <table className="w-full min-w-[700px] text-left">
              <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Property</th>
                  <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Stats</th>
                  <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(prop => (
                  <tr 
                    key={prop.id} 
                    onClick={() => setSelectedProperty(prop)}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 px-6 flex items-center gap-4">
                      <img src={prop.imageUrl || '/property-placeholder.png'} alt={prop.name} className="w-16 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{prop.name}</p>
                        <p className="text-sm text-zinc-500 flex items-center gap-1.5"><MapPin size={12}/>{prop.address}</p>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-zinc-500"><Users size={14}/> <span className="font-bold text-zinc-900 dark:text-white">{getTenantCount(prop.id)}</span></div>
                          <div className="flex items-center gap-1.5 text-zinc-500"><Bed size={14}/> <span className="font-bold text-zinc-900 dark:text-white">{prop.bedrooms}</span></div>
                          <div className="flex items-center gap-1.5 text-zinc-500"><Bath size={14}/> <span className="font-bold text-zinc-900 dark:text-white">{prop.bathrooms}</span></div>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right">
                       <button className="text-zinc-400 hover:text-blue-600 p-2 transition-colors"><Edit size={16} /></button>
                       <button className="text-zinc-400 hover:text-rose-500 p-2 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="h-full bg-zinc-200 text-center flex items-center justify-center text-zinc-500">Map View Placeholder</div>
          </div>
        )}
      </div>
      
      {selectedProperty && (
         <div className="w-full xl:w-96 xl:h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 flex flex-col animate-in slide-in-from-right-12 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">Property Details</h2>
            <button onClick={() => setSelectedProperty(null)} className="text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500 dark:hover:bg-rose-500 transition-all"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 -mx-6 px-6">
             <img src={selectedProperty.imageUrl || '/property-placeholder.png'} alt={selectedProperty.name} className="w-full h-48 rounded-lg object-cover" />
             <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedProperty.name}</h3>
             <p className="text-sm text-zinc-500 flex items-center gap-2"><MapPin size={14} /> {selectedProperty.address}</p>

            <div className="grid grid-cols-3 gap-4 text-center py-4 border-y border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Rent</p>
                    <p className="font-bold text-lg text-zinc-900 dark:text-white">${selectedProperty.rent.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Deposit</p>
                    <p className="font-bold text-lg text-zinc-900 dark:text-white">${selectedProperty.deposit.toLocaleString()}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Type</p>
                    <p className="font-bold text-lg text-zinc-900 dark:text-white capitalize">{selectedProperty.type}</p>
                </div>
            </div>

             <div className="grid grid-cols-3 gap-4 text-center py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-center gap-2"><Bed size={20} className="text-zinc-400"/><span className="font-bold text-lg">{selectedProperty.bedrooms}</span></div>
                <div className="flex items-center justify-center gap-2"><Bath size={20} className="text-zinc-400"/><span className="font-bold text-lg">{selectedProperty.bathrooms}</span></div>
                {selectedProperty.parking && <div className="flex items-center justify-center gap-2"><Car size={20} className="text-zinc-400"/><span className="font-bold text-lg">Yes</span></div>}
            </div>

             <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest pt-4">Tenants</h4>
             {/* Tenant list would go here */}
             <p className="text-sm text-zinc-500">No tenants currently assigned.</p>

          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;