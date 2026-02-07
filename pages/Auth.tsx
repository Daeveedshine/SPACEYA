import React, { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { saveUser, getStore } from "../store";
import { User, UserRole } from "../types";
import { Mail, Lock, User as UserIcon, Briefcase, Shield } from 'lucide-react';

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
      if (!store.users.find((u) => u.id === user.uid)) {
        const newUser: Omit<User, 'displayId'> = {
          id: user.uid,
          name: user.displayName || "Unnamed User",
          email: user.email || "",
          role: UserRole.TENANT, // Default role
          avatar: user.photoURL || "",
        };
        await saveUser(newUser);
      }
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: Omit<User, 'displayId'> = {
          id: userCredential.user.uid,
          name: fullName,
          email: email,
          role: role,
          avatar: "",
        };
        await saveUser(newUser);
      }
      onAuthSuccess();
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            setError("An account with this email already exists. Please sign in instead.");
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            setError("Invalid email or password.");
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-offwhite dark:bg-black p-4">
      <div className="w-full max-w-sm">
          <div className="text-center mb-8">
              <h1 className="font-black text-5xl tracking-tighter text-zinc-900 dark:text-white">spaceya</h1>
              <p className="text-zinc-500 text-sm mt-1">{isLogin ? "Welcome back, sign in to your account." : "Create an account to get started."}</p>
          </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
            <form className="space-y-4" onSubmit={handleEmailAuth}>
            {!isLogin && (
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                    <input placeholder="Full Name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
                </div>
            )}
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                <input placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                <input placeholder="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
            </div>
            
            {!isLogin && (
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20}/>
                    <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full bg-offwhite dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 outline-none appearance-none focus:ring-2 focus:ring-blue-600 transition-all">
                        <option value={UserRole.TENANT}>I'm a Tenant</option>
                        <option value={UserRole.AGENT}>I'm a Property Manager</option>
                    </select>
                </div>
            )}
            
            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg">{error}</p>}
            
            <button type="submit" className="w-full px-4 py-3 text-white font-bold text-sm uppercase tracking-widest bg-blue-600 rounded-lg active:scale-95 transition-transform">
                {isLogin ? "Sign In" : "Sign Up"}
            </button>
            </form>
            
            <div className="flex items-center justify-center my-6">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                <div className="px-4 text-zinc-400 text-xs uppercase">OR</div>
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            
            <button onClick={handleGoogleSignIn} className="w-full px-4 py-3 border dark:border-zinc-800 flex justify-center items-center gap-2 rounded-lg active:scale-95 transition-transform hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Sign in with Google</span>
            </button>

        </div>
        <p className="text-sm text-center mt-8 text-zinc-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-blue-600 hover:underline ml-1 font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
            </button>
        </p>
         <div className="text-center mt-4">
            <a href="#" className="text-xs text-zinc-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                Privacy Policy <Shield size={12}/>
            </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
