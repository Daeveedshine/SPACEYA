import React, { useState, useMemo } from "react";
import { Application, ApplicationStatus, User, UserRole } from "../types";
import { getStore } from "../store";
import { format, parseISO } from 'date-fns';
import { Search, ChevronDown, UserCheck, UserX, Clock, FileText, CheckCircle, XCircle } from "lucide-react";

interface ApplicationsProps {
  user: User;
  onNavigate: (view: string) => void;
  onUpdate?: () => void;
}

const Applications: React.FC<ApplicationsProps> = ({ user, onNavigate, onUpdate }) => {
  const [store, setStore] = useState(getStore());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  const applications = useMemo(() => {
    // Agents see applications for their properties, tenants see their own applications.
    const userApplications = user.role === UserRole.AGENT 
      ? store.applications.filter(app => store.properties.some(p => p.id === app.propertyId && p.agentId === user.id))
      : store.applications.filter(app => app.userId === user.id);
    
    let filteredApps = userApplications;

    if (statusFilter !== "all") {
      filteredApps = filteredApps.filter(a => a.status === statusFilter);
    }

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filteredApps = filteredApps.filter(app => {
        const applicant = store.users.find(u => u.id === app.userId);
        const property = store.properties.find(p => p.id === app.propertyId);
        return (
          applicant?.name.toLowerCase().includes(lowercasedSearch) ||
          property?.name.toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    return filteredApps;

  }, [store, user, searchTerm, statusFilter]);

  const StatusCell: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const statusConfig = {
      [ApplicationStatus.PENDING]: { icon: Clock, text: "Pending", color: "text-yellow-500" },
      [ApplicationStatus.APPROVED]: { icon: UserCheck, text: "Approved", color: "text-green-500" },
      [ApplicationStatus.REJECTED]: { icon: UserX, text: "Rejected", color: "text-rose-500" },
    };
    const config = statusConfig[status];
    return (
      <div className={`flex items-center gap-2 font-semibold ${config.color}`}>
        <config.icon size={16} />
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Applications</h1>
           {user.role === UserRole.TENANT && <button className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">Apply Now</button>}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
         <div className="flex items-center gap-2 mb-4">
             <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by applicant or property..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
            {/* Add filter dropdown */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Applicant</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Property</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Submitted</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const applicant = store.users.find(u => u.id === app.userId);
                const property = store.properties.find(p => p.id === app.propertyId);
                return (
                  <tr key={app.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 px-6 font-semibold text-zinc-900 dark:text-white">{applicant?.name || 'Unknown User'}</td>
                    <td className="p-4 px-6 text-sm text-zinc-500">{property?.name || 'Unknown Property'}</td>
                    <td className="p-4 px-6 text-sm text-zinc-500">{format(parseISO(app.submittedAt), 'MMM d, yyyy')}</td>
                    <td className="p-4 px-6"><StatusCell status={app.status} /></td>
                    <td className="p-4 px-6 text-right space-x-2">
                        <button className="p-2 text-zinc-400 hover:text-blue-600"><FileText size={16} /></button>
                        {user.role === UserRole.AGENT && app.status === ApplicationStatus.PENDING && (
                          <>
                            <button className="p-2 text-zinc-400 hover:text-green-600"><CheckCircle size={16} /></button>
                            <button className="p-2 text-zinc-400 hover:text-rose-500"><XCircle size={16} /></button>
                          </>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Applications;
