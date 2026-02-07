import React, { useState, useMemo } from "react";
import { MaintenanceTicket, TicketStatus, User, UserRole } from "../types";
import { getStore } from "../store";
import { format, parseISO } from 'date-fns';
import { Search, ChevronDown, Tag, Wrench, Calendar, User as UserIcon, Building, X, MessageSquare, Send } from "lucide-react";

interface MaintenanceProps {
  user: User;
  onUpdate?: () => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ user, onUpdate }) => {
  const [store, setStore] = useState(getStore());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  const tickets = useMemo(() => {
    let filteredTickets = user.role === UserRole.AGENT 
      ? store.tickets 
      : store.tickets.filter(t => t.tenantId === user.id);

    if (statusFilter !== "all") {
      filteredTickets = filteredTickets.filter(t => t.status === statusFilter);
    }

    if (searchTerm) {
      filteredTickets = filteredTickets.filter(t => 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.properties.find(p => p.id === t.propertyId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredTickets;
  }, [store, user, searchTerm, statusFilter]);

  const getTenant = (tenantId: string) => store.users.find(u => u.id === tenantId);
  const getProperty = (propertyId: string) => store.properties.find(p => p.id === propertyId);

  const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const statusInfo = {
      [TicketStatus.OPEN]: { text: "Open", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      [TicketStatus.IN_PROGRESS]: { text: "In Progress", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
      [TicketStatus.RESOLVED]: { text: "Resolved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      [TicketStatus.CLOSED]: { text: "Closed", color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300" },
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo[status].color}`}>{statusInfo[status].text}</span>;
  };

  return (
    <div className="h-full flex flex-col xl:flex-row p-4 sm:p-6 md:p-8 gap-6 bg-offwhite dark:bg-black">
      <div className="flex-1 h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Maintenance Requests</h1>
           {user.role === UserRole.TENANT && <button className="bg-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">New Request</button>}
        </div>
        <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
            {/* Add status filter dropdown here */}
        </div>
        <div className="flex-1 overflow-y-auto -mx-6">
          <table className="w-full min-w-[700px] text-left">
            <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Request</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Submitted</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="p-4 px-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Property</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => {
                const property = getProperty(ticket.propertyId);
                const tenant = getTenant(ticket.tenantId);
                return (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 px-6">
                      <p className="font-bold text-zinc-900 dark:text-white">{ticket.subject}</p>
                      <p className="text-sm text-zinc-500">#{ticket.id.slice(-6)}</p>
                    </td>
                    <td className="p-4 px-6 text-sm text-zinc-500">
                      <p>{format(parseISO(ticket.createdAt), 'MMM d, yyyy')}</p>
                      {user.role === UserRole.AGENT && tenant && <p>by {tenant.name}</p>}
                    </td>
                    <td className="p-4 px-6"><StatusBadge status={ticket.status} /></td>
                    <td className="p-4 px-6 text-sm text-zinc-500">
                        <p className="font-bold text-zinc-900 dark:text-white">{property?.name}</p>
                        <p>{property?.address}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedTicket && (
         <div className="w-full xl:w-[32rem] xl:h-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 flex flex-col animate-in slide-in-from-right-12 duration-500">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{selectedTicket.subject}</h2>
                    <StatusBadge status={selectedTicket.status} />
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500 dark:hover:bg-rose-500 transition-all"><X size={18} /></button>
            </div>
             <div className="flex-1 overflow-y-auto space-y-6 -mx-6 px-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                <div className="text-sm space-y-3">
                  <div className="flex items-center gap-3"><Calendar size={16} className="text-zinc-400"/><span>Reported on {format(parseISO(selectedTicket.createdAt), 'PPP')}</span></div>
                  {user.role === UserRole.AGENT && <div className="flex items-center gap-3"><UserIcon size={16} className="text-zinc-400"/><span>Tenant: {getTenant(selectedTicket.tenantId)?.name}</span></div>}
                  <div className="flex items-center gap-3"><Building size={16} className="text-zinc-400"/><span>Property: {getProperty(selectedTicket.propertyId)?.name}</span></div>
                </div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pt-4 border-t border-zinc-100 dark:border-zinc-800">Conversation</h3>
                {/* Message list would go here */}
                <div className="text-sm text-center text-zinc-500 py-8">No messages yet.</div>
             </div>
             <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                    <input placeholder="Type a message..." className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md"><Send size={16} /></button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;