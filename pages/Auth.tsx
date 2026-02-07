import React, { useState } from "react";
import { User, UserRole } from "../types";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStore, saveUser, generateDisplayId, saveStore } from "../store";
import { Mail, Key, User as UserIcon, Shield } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.TENANT);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const store = getStore();
      const existingUser = store.users.find((u) => u.id === user.uid);
      if (!existingUser) {
        const newUser: Omit<User, 'displayId'> = {
          id: user.uid,
          name: user.displayName || "Unnamed User",
          email: user.email || "",
          role: UserRole.TENANT, // Default role
          avatar: user.photoURL || "",
        };
        await saveUser(newUser);
      }
      await runDataDoctor(); // Run the data integrity check
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const newUser: Omit<User, 'displayId'> = {
          id: user.uid,
          name: fullName,
          email: email,
          role: role,
          avatar: "",
        };
        await saveUser(newUser);
      }
      await runDataDoctor(); // Run the data integrity check
      onAuthSuccess();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // --- DATA DOCTOR SCRIPT ---
  const runDataDoctor = async () => {
    console.log("DATA DOCTOR: Starting data integrity check...");
    const store = getStore();
    let wasModified = false;

    const existingIds = store.users.map(u => u.displayId).filter(Boolean);

    const repairedUsers = store.users.map(user => {
      // Check if displayId is missing, empty, or uses the old Firebase ID format
      if (!user.displayId || user.displayId === user.id) {
        console.log(`DATA DOCTOR: Repairing user ${user.name} (ID: ${user.id})`);
        const newDisplayId = generateDisplayId(user.role, existingIds);
        existingIds.push(newDisplayId);
        wasModified = true;
        return { ...user, displayId: newDisplayId };
      }
      return user;
    });

    if (wasModified) {
      console.log("DATA DOCTOR: Found and repaired inconsistent data. Saving to database...");
      const newState = { ...store, users: repairedUsers };
      await saveStore(newState);
      console.log("DATA DOCTOR: Database updated successfully.");
    } else {
      console.log("DATA DOCTOR: No data inconsistencies found. Your database is clean.");
    }
  };
  // --- END OF DATA DOCTOR SCRIPT ---

  return (
    <div className="flex items-center justify-center h-screen bg-offwhite dark:bg-black font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Welcome</h2>
          <p className="text-zinc-500 font-medium mt-2 text-sm">{isLogin ? "Sign in to continue" : "Create an account to get started"}</p>
        </div>

        <form className="space-y-6" onSubmit={handleEmailAuth}>
          {!isLogin && (
            <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input placeholder="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
          </div>

          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
          </div>

          {!isLogin && (
             <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full pl-12 pr-4 py-4 bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-600 transition-all">
                    <option value={UserRole.TENANT}>I am a Tenant</option>
                    <option value={UserRole.AGENT}>I am an Agent</option>
                </select>
             </div>
          )}
          
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all">
            {isLogin ? "Sign In" : "Create Account"}
          </button>

          {error && <p className="text-rose-500 text-sm font-semibold text-center">{error}</p>}
        </form>

        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200 dark:border-zinc-700"></span></div>
            <p className="relative bg-white dark:bg-zinc-900 px-4 text-sm text-zinc-400 font-medium">OR</p>
        </div>

        <button onClick={handleGoogleSignIn} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 py-4 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
          <img src="/google.svg" alt="Google" className="w-5 h-5" />
          Sign In with Google
        </button>

        <p className="text-center text-sm text-zinc-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-600 ml-1">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
