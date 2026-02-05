
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, FormTemplate, FormField } from '../types';
import { getStore, saveStore } from '../store';
import { 
  User as UserIcon, Mail, Phone, Shield, Save, CheckCircle2, 
  AlertCircle, Copy, Check, Link as LinkIcon, FileText, 
  Settings as SettingsIcon, PenTool, Plus, Trash2, GripVertical, X, Loader2,
  Camera, ArrowUp, ArrowDown
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const DEFAULT_AGENT_TEMPLATE: any = {}; // Placeholder, assuming it's defined elsewhere

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'form'>('general');
  const [name, setName] = useState(user.name);
  const [userPhone, setUserPhone] = useState(user.phone || '');
  const [profilePic, setProfilePic] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  useEffect(() => {
    if (user.role === UserRole.AGENT && activeTab === 'form') {
      const store = getStore();
      const existingTemplate = store.formTemplates.find((t: any) => t.agentId === user.id);
      
      if (existingTemplate) {
        setEditingTemplate(JSON.parse(JSON.stringify(existingTemplate)));
      } else {
        const defaultT = JSON.parse(JSON.stringify(DEFAULT_AGENT_TEMPLATE));
        defaultT.agentId = user.id;
        setEditingTemplate(defaultT);
      }
    }
  }, [user.id, user.role, activeTab]);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      const store = getStore();
      const updatedUser = { ...user, name, phone: userPhone, profilePictureUrl: profilePic };
      
      const updatedUsers = store.users.map(u => u.id === user.id ? updatedUser : u);
      const newState = { ...store, users: updatedUsers, currentUser: updatedUser };
      
      saveStore(newState);
      onUserUpdate(updatedUser);
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 1000);
  };

  const handleCopyId = () => {
    if (user.displayId) {
        navigator.clipboard.writeText(user.displayId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
      if (user.displayId) {
          const url = `${window.location.origin}?ref=${user.displayId}`;
          navigator.clipboard.writeText(url);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
      }
  };

  // --- FORM BUILDER HANDLERS ---
  // Omitted for brevity, assuming they exist as in the original file

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">My Profile</h1>
          <p className="text-zinc-500 font-medium mt-1">Manage your identification and suite configuration.</p>
        </div>
        
        {user.role === UserRole.AGENT && (
          <div className="flex p-1 bg-zinc-100 dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800">
             <button 
               onClick={() => setActiveTab('general')}
               className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
             >
               Identity
             </button>
             <button 
               onClick={() => setActiveTab('form')}
               className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'form' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
             >
               Form Builder
             </button>
          </div>
        )}
      </header>

      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-left-4 duration-500">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center text-center shadow-2xl">
              <div 
                className="relative group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-28 h-28 bg-white rounded-[2rem] overflow-hidden flex items-center justify-center text-zinc-300 border border-zinc-200 text-3xl font-black shadow-lg mb-6 relative">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 text-white border-4 border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Plus size={14} />
                </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />

              <h2 className="text-2xl font-black text-white">{user.name}</h2>
              <div className="mt-2 inline-flex items-center px-4 py-1.5 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                <Shield size={12} className="mr-2" /> {user.role}
              </div>
              
              <div className="mt-8 w-full pt-8 border-t border-zinc-800 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Display UID</p>
                    <div className="bg-black p-3 rounded-xl border border-zinc-800 flex items-center justify-between group">
                      <span className="text-sm font-mono font-bold text-blue-400">{user.displayId}</span>
                      <button 
                          onClick={handleCopyId}
                          className="p-2 text-zinc-600 hover:text-white transition-colors rounded-lg active:scale-95"
                          title="Copy ID"
                      >
                          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="mt-2 text-[9px] text-zinc-600 font-medium italic">This is your permanent, non-editable universal ID.</p>
                 </div>

                 {user.role === UserRole.AGENT && (
                   <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Tenant Onboarding Link</p>
                      <div className="bg-blue-900/10 p-3 rounded-xl border border-blue-600/20 flex items-center justify-between group cursor-pointer" onClick={handleCopyLink}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <LinkIcon size={14} className="text-blue-500 shrink-0" />
                            <span className="text-xs font-medium text-blue-400 truncate">spaceya.app?ref={user.displayId}</span>
                        </div>
                        <button 
                            className="p-2 text-blue-400 hover:text-white transition-colors rounded-lg"
                        >
                            {linkCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="mt-2 text-[9px] text-zinc-600 font-medium italic">Share this link. New tenants will be auto-routed to you.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {/* Settings Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 shadow-sm border border-zinc-100 dark:border-zinc-800">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-zinc-900 dark:text-white">General Settings</h3>
                 {showSaved && (
                   <div className="flex items-center text-emerald-600 text-xs font-black uppercase animate-in fade-in slide-in-from-right-4">
                     <CheckCircle2 size={16} className="mr-2" /> Changes Saved
                   </div>
                 )}
               </div>

               <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                          className="w-full pl-11 pr-5 py-4 bg-offwhite dark:bg-black border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-zinc-900 dark:text-white"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                          className="w-full pl-11 pr-5 py-4 bg-offwhite dark:bg-black border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-zinc-900 dark:text-white"
                          value={userPhone}
                          onChange={e => setUserPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Account Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        className="w-full pl-11 pr-5 py-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-500 cursor-not-allowed"
                        value={user.email}
                        disabled
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-zinc-400 font-medium ml-1">Email changes require admin verification.</p>
                  </div>

                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                     <button 
                       type="submit"
                       disabled={isSaving}
                       className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center disabled:opacity-50"
                     >
                       {isSaving ? 'Processing...' : (
                         <><Save size={16} className="mr-2" /> Commit Changes</>
                       )}
                     </button>
                  </div>
               </form>
            </div>

            <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/20 flex items-start space-x-4">
               <div className="p-3 bg-amber-600/10 text-amber-600 rounded-xl shrink-0">
                  <AlertCircle size={24} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest">Security Notice</h4>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">Your Display UID is a permanent, public identifier. Share it with trusted parties to connect applications and services within the Spaceya ecosystem.</p>
               </div>
            </div>
          </div>
        </div>
      ) : (
        // Form Builder JSX would be here
        <div>Form Builder coming soon...</div>
      )}
    </div>
  );
};

export default Profile;
