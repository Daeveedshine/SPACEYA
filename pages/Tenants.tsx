import React, { useState, useMemo } from "react";
import { User, UserRole } from "../types";
import { getStore } from "../store";
import { Search, ChevronDown, Mail, Phone, MapPin, Shield, Edit, Trash2, Plus, X } from "lucide-react";

interface TenantsProps {
  onUpdate?: () => void;
}

const Tenants: React.FC<TenantsProps> = ({ onUpdate }) => {
  const [store, setStore] = useState(getStore());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);

  const tenants = useMemo(() => 
    store.users.filter(user => 
      user.role === UserRole.TENANT &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [store.users, searchTerm]);

  const getPropertyInfo = (tenantId: string) => {
    const agreement = store.agreements.find(a => a.tenantId === tenantId);
    if (!agreement) return { name: "No Property Assigned", address: "N/A" };
    const property = store.properties.find(p => p.id === agreement.propertyId);
    return property ? { name: property.name, address: property.address } : { name: "Property Not Found", address: "N/A" };
  };

  return (
    <div className="h-full flex flex-col xl:flex-row p-4 sm:p-6 md:p-8 gap-6 bg-offwhite dark:bg-black">
      <div className="flex-1 h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">My Tenants</h1>
          <button className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
            <Plus size={16} />
            Add Tenant
          </button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>
        <div className="flex-1 overflow-y-auto -mx-6">
          <table className="w-full min-w-[600px] text-left">
            <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Tenant</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Property</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => {
                const property = getPropertyInfo(tenant.id);
                return (
                  <tr 
                    key={tenant.id} 
                    onClick={() => setSelectedTenant(tenant)}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 px-6 flex items-center gap-4">
                      <img src={tenant.avatar || '/user-placeholder.png'} alt={tenant.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{tenant.name}</p>
                        <p className="text-sm text-zinc-500">{tenant.email}</p>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                       <p className="font-bold text-zinc-900 dark:text-white">{property.name}</p>
                       <p className="text-sm text-zinc-500">{property.address}</p>
                    </td>
                    <td className="p-4 px-6 text-right">
                       <button className="text-zinc-400 hover:text-blue-600 p-2 transition-colors"><Edit size={16} /></button>
                       <button className="text-zinc-400 hover:text-rose-500 p-2 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTenant && (
        <div className="w-full xl:w-96 xl:h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 flex flex-col animate-in slide-in-from-right-12 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">Tenant Profile</h2>
            <button onClick={() => setSelectedTenant(null)} className="text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500 dark:hover:bg-rose-500 transition-all"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="flex flex-col items-center text-center">
                <img src={selectedTenant.avatar || '/user-placeholder.png'} alt={selectedTenant.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{selectedTenant.name}</p>
                <p className="text-sm text-zinc-500">{selectedTenant.email}</p>
            </div>
            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-4 text-sm">
                <Phone size={16} className="text-zinc-400 mt-1" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">Phone Number</p>
                  <p className="text-zinc-500">{store.applications.find(a => a.userId === selectedTenant.id)?.phoneNumber || "Not Provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-sm">
                <MapPin size={16} className="text-zinc-400 mt-1" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">Current Address</p>
                  <p className="text-zinc-500">{store.applications.find(a => a.userId === selectedTenant.id)?.currentHomeAddress || "Not Provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-sm">
                <Shield size={16} className="text-zinc-400 mt-1" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">Tenant ID</p>
                  <p className="text-zinc-500 font-mono text-xs">{selectedTenant.displayId}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <button className="flex-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg active:scale-95 transition-transform">View Dossier</button>
            <button className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg active:scale-95 transition-transform">View Agreement</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;