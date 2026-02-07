import React, { useState, useMemo } from 'react';
import { getStore, saveMaintenanceRequest } from '../store';
import { User, UserRole, MaintenanceRequest, Property } from '../types';
import { Search, PlusCircle, Wrench, Calendar, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MaintenanceProps {
    user: User;
    onUpdate: () => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ user, onUpdate }) => {
    const [store, setStore] = useState(getStore());
    const [searchTerm, setSearchTerm] = useState('');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [newRequest, setNewRequest] = useState({ title: '', description: '', propertyId: '' });

    const handleAddRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user.role !== UserRole.TENANT || !newRequest.propertyId) return;

        const requestData: Omit<MaintenanceRequest, 'id' | 'displayId' | 'status' | 'createdAt'> = {
            title: newRequest.title,
            description: newRequest.description,
            propertyId: newRequest.propertyId,
            userId: user.id,
        };
        
        await saveMaintenanceRequest(requestData);
        setShowRequestForm(false);
        setNewRequest({ title: '', description: '', propertyId: '' });
        onUpdate();
        setStore(getStore());
    };

    const userProperties = useMemo(() => {
        return store.properties.filter(p => 
            store.applications.some(a => a.userId === user.id && a.propertyId === p.id && a.status === 'approved')
        );
    }, [store, user.id]);

    const maintenanceRequests = useMemo(() => {
        let requests = user.role === UserRole.AGENT
            ? store.maintenanceRequests.filter(r => store.properties.some(p => p.agentId === user.id && p.id === r.propertyId))
            : store.maintenanceRequests.filter(r => r.userId === user.id);

        if (!searchTerm) return requests;

        return requests.filter(r => 
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [store, user, searchTerm]);
    
    const getStatusChip = (status: 'pending' | 'in-progress' | 'completed') => {
        switch(status) {
            case 'pending':
                return <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-500/10 font-bold px-2 py-1 rounded-full"><Clock size={12}/>Pending</div>;
            case 'in-progress':
                return <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-500/10 font-bold px-2 py-1 rounded-full"><Wrench size={12}/>In Progress</div>;
            case 'completed':
                return <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 font-bold px-2 py-1 rounded-full"><CheckCircle size={12}/>Completed</div>;
        }
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Maintenance</h1>
                {user.role === UserRole.TENANT && (
                    <button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                        <PlusCircle size={16}/>
                        <span>New Request</span>
                    </button>
                )}
            </div>

            {showRequestForm && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">New Maintenance Request</h2>
                    <form onSubmit={handleAddRequest} className="space-y-4">
                        <select value={newRequest.propertyId} onChange={(e) => setNewRequest({ ...newRequest, propertyId: e.target.value })} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 appearance-none" required>
                            <option value="" disabled>Select your property</option>
                            {userProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="text" placeholder="Request Title" value={newRequest.title} onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3" required />
                        <textarea placeholder="Describe the issue..." value={newRequest.description} onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 h-24" required />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowRequestForm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search requests..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                </div>

                <div className="space-y-4">
                    {maintenanceRequests.map(request => {
                        const property = store.properties.find(p => p.id === request.propertyId);
                        const tenant = store.users.find(u => u.id === request.userId);
                        return (
                            <div key={request.id} className="bg-offwhite dark:bg-black rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{request.title}</h3>
                                        <p className="text-sm text-zinc-500">For <span className='font-semibold'>{property?.name || 'N/A'}</span></p>
                                        {user.role === UserRole.AGENT && <p className="text-sm text-zinc-500">By <span className='font-semibold'>{tenant?.name || 'N/A'}</span></p>}
                                    </div>
                                    {getStatusChip(request.status)}
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{request.description}</p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1"><Calendar size={12}/> Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</div>
                                    <button className="flex items-center gap-1 hover:text-blue-600"><MessageSquare size={12}/> Chat</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
