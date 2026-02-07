import React, { useState, useEffect } from "react";
import { getStore, saveStore, initFirebaseSync, AppState } from "./store";
import { UserRole } from "./types";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Agents from "./pages/Agents";
import Agreements from "./pages/Agreements";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
import Applications from "./pages/Applications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  const [store, setStore] = useState<AppState>(getStore());
  const [isSyncing, setIsSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firestore real-time sync
    const unsubscribe = initFirebaseSync(
      (newState) => {
        setStore(newState);
        setIsSyncing(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to connect to the database.");
        setIsSyncing(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleUpdate = () => {
    setStore(getStore());
  };

  const { currentUser, theme, users, properties, agreements, payments, tickets, applications, settings } = store;

  if (!currentUser) {
    return <Auth onAuthSuccess={handleUpdate} />;
  }

  const Views: { [key: string]: React.ReactElement } = {
    dashboard: <Dashboard user={currentUser} stats={{ properties: properties.length, tenants: users.filter(u => u.role === UserRole.TENANT).length, agents: users.filter(u => u.role === UserRole.AGENT).length, income: payments.reduce((acc, p) => acc + p.amount, 0) }} />,
    properties: <Properties user={currentUser} onUpdate={handleUpdate} />,
    tenants: <Tenants onUpdate={handleUpdate} />,
    agents: <Agents onUpdate={handleUpdate} />,
    agreements: <Agreements user={currentUser} onUpdate={handleUpdate} />,
    payments: <Payments user={currentUser} onUpdate={handleUpdate} />,
    maintenance: <Maintenance user={currentUser} onUpdate={handleUpdate} />,
    applications: <Applications user={currentUser} onNavigate={() => {}} onUpdate={handleUpdate} />,
    settings: <Settings user={currentUser} onUpdate={handleUpdate} />,
  };

  const [activeView, setActiveView] = useState("dashboard");
  const CurrentView = Views[activeView];

  return (
    <div className={`flex h-screen bg-offwhite dark:bg-black font-sans transition-colors duration-500 ${theme}`}>
      <Toaster />
      <Sidebar user={currentUser} activeView={activeView} onNavigate={setActiveView} onLogout={() => { saveStore({ ...store, currentUser: null }); handleUpdate(); }} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {isSyncing ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500">Syncing data...</p>
          </div>
        ) : error ? (
           <div className="flex items-center justify-center h-full">
            <p className="text-rose-500">{error}</p>
          </div>
        ) : (
          CurrentView
        )}
      </main>
    </div>
  );
};

export default App;
