import React, { useMemo, useState } from 'react';
import { getStore, saveApplication } from '../store';
import { User, UserRole, Application, Property } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Search, PlusCircle, Calendar, FileText, Check, X } from 'lucide-react';

interface ApplicationsProps {
    user: User;
    onUpdate: () => void;
}

const Applications: React.FC<ApplicationsProps> = ({ user, onUpdate }) => {
    const [store, setStore] = useState(getStore());
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const handleApply = async () => {
        if (!selectedProperty || user.role !== UserRole.TENANT) return;
        const applicationData: Omit<Application, 'id' | 'displayId' | 'status' | 'createdAt'> = {
            userId: user.id,
            propertyId: selectedProperty.id,
        };
        await saveApplication(applicationData);
        setShowApplyForm(false);
        setSelectedProperty(null);
        onUpdate();
        setStore(getStore());
    };

    const handleApplicationStatus = async(applicationId: string, status: 'approved' | 'rejected') => {
        // This is a placeholder for updating the application status in the backend
        console.log(`Updating application ${applicationId} to ${status}`);
        // You would typically call a function like `updateApplicationStatus(applicationId, status)`
        // For now, let's just refresh the data to simulate the change
        onUpdate();
        setStore(getStore());
    }

    const applications = useMemo(() => {
        if (user.role === UserRole.AGENT) {
            const agentPropertyIds = store.properties.filter(p => p.agentId === user.id).map(p => p.id);
            return store.applications.filter(a => agentPropertyIds.includes(a.propertyId));
        }
        return store.applications.filter(a => a.userId === user.id);
    }, [store, user]);
    
    const availableProperties = useMemo(() => {
         return store.properties.filter(p => {
             const isOccupied = store.applications.some(a => a.propertyId === p.id && a.status === 'approved');
             const hasApplied = store.applications.some(a => a.propertyId === p.id && a.userId === user.id);
             return !isOccupied && !hasApplied;
         });
    }, [store, user.id]);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Applications</h1>
                {user.role === UserRole.TENANT && (
                    <button onClick={() => setShowApplyForm(true)} className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                        <PlusCircle size={16}/>
                        <span>Apply for Property</span>
                    </button>
                )}
            </div>

            {showApplyForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 w-full max-w-md">
                         <h2 className="text-2xl font-bold mb-4">Apply for a New Property</h2>
                         <p className="text-sm text-zinc-500 mb-4">Select an available property from the list below to submit your application.</p>
                         <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                            {availableProperties.map(p => (
                                <div key={p.id} onClick={() => setSelectedProperty(p)} className={`p-4 rounded-lg border cursor-pointer ${selectedProperty?.id === p.id ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-offwhite dark:bg-black border-zinc-200 dark:border-zinc-800'}`}>
                                    <h3 className="font-semibold">{p.name}</h3>
                                    <p className="text-xs text-zinc-500">{p.address}</p>
                                </div>
                            ))}
                         </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold">Cancel</button>
                            <button onClick={handleApply} disabled={!selectedProperty} className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:bg-zinc-400 disabled:cursor-not-allowed">Submit Application</button>
                        </div>
                    </div>
                </div>
            )}

             <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                    {applications.map(app => {
                        const property = store.properties.find(p => p.id === app.propertyId);
                        const tenant = store.users.find(u => u.id === app.userId);
                        return (
                            <div key={app.id} className="bg-offwhite dark:bg-black rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Application for {property?.name}</h3>
                                    {user.role === UserRole.AGENT && <p className="text-sm text-zinc-500">Applicant: <span className='font-semibold'>{tenant?.name}</span></p>}
                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Calendar size={12}/> Submitted {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                     <p className={`text-sm font-bold capitalize px-3 py-1 rounded-full ${app.status === 'approved' ? 'bg-green-500/10 text-green-500' : app.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{app.status}</p>
                                     {user.role === UserRole.AGENT && app.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApplicationStatus(app.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500/20"><Check size={16}/></button>
                                            <button onClick={() => handleApplicationStatus(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20"><X size={16}/></button>
                                        </div>
                                     )}
                                </div>
                            </div>
                        );
                    })}
                    {applications.length === 0 && (
                         <div className="text-center py-10">
                            <FileText size={48} className="mx-auto text-zinc-400"/>
                            <h3 className="mt-4 text-lg font-semibold">No Applications Found</h3>
                            <p className="mt-1 text-sm text-zinc-500">{user.role === UserRole.TENANT ? 'You have not submitted any applications yet.' : 'No tenants have applied to your properties yet.'}</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Applications;
