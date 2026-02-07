import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { Mail, User as UserIcon, Shield, Camera, Save } from 'lucide-react';

interface SettingsProps {
    user: User;
    onUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
    const [name, setName] = useState(user.name);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [isEditing, setIsEditing] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // In a real app, you would upload the avatarFile to a storage service (like Firebase Storage)
            // and get back a URL.
            let avatarURL = user.avatar;
            if (avatarFile) {
                // This is a placeholder for the upload logic
                console.log("Uploading avatar...");
                // avatarURL = await uploadFile(avatarFile);
                avatarURL = avatarPreview; // For now, use the local preview URL
            }

            await updateProfile(currentUser, { 
                displayName: name,
                photoURL: avatarURL
            });

            // You would also update the user data in your database here
            console.log("Profile updated in Firebase Auth. Update your DB next.");

            onUpdate(); // Re-fetch user data
            setIsEditing(false);

        } catch(error) {
            console.error("Error updating profile: ", error);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-6">Settings</h1>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-bold">Profile</h2>
                    <p className="text-zinc-500 text-sm">Manage your personal information.</p>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={avatarPreview || '/user-placeholder.png'} alt="Avatar" className="w-24 h-24 rounded-full object-cover"/>
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer text-white hover:bg-blue-700">
                                <Camera size={16}/>
                            </label>
                            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
                        </div>
                        <div className="relative w-full">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                            <input type="text" value={name} onChange={(e) => {setName(e.target.value); setIsEditing(true);}} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3" />
                        </div>
                    </div>
                    {isEditing && (
                         <div className="flex justify-end mt-6">
                            <button onClick={handleSave} className="bg-green-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-lg flex items-center gap-2 active:scale-95 transition-transform">
                                <Save size={16}/>
                                <span>Save Changes</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

             <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-bold">Account</h2>
                    <p className="text-zinc-500 text-sm">Manage your account settings.</p>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                            <input type="email" value={user.email} disabled className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-500" />
                        </div>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                            <input type="text" value={user.role} disabled className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-500 capitalize" />
                        </div>
                         <button className="text-sm text-red-500 font-semibold">Delete Account</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Settings;
