import React, { useState, useMemo } from "react";
import { User, Notification, NotificationType } from "../types";
import { getStore, saveStore } from "../store";
import {
  Bell,
  Check,
  Trash2,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Search,
  Download,
  ArrowRight,
} from "lucide-react";

interface NotificationsProps {
  user: User;
  onRefreshCount: () => void;
  onNavigate: (view: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  user,
  onRefreshCount,
  onNavigate,
}) => {
  const [store, setStore] = useState(getStore());
  const [searchTerm, setSearchTerm] = useState("");

  const notifications = useMemo(() => {
    return store.notifications
      .filter((n) => n.userId === user.id)
      .filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [store.notifications, user.id, searchTerm]);

  const handleMarkAsRead = (id: string) => {
    const updated = store.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    const newState = { ...store, notifications: updated };
    saveStore(newState);
    setStore(newState);
    onRefreshCount();
  };

  const handleMarkAllRead = () => {
    const updated = store.notifications.map((n) =>
      n.userId === user.id ? { ...n, isRead: true } : n,
    );
    const newState = { ...store, notifications: updated };
    saveStore(newState);
    setStore(newState);
    onRefreshCount();
  };

  const handleDelete = (id: string) => {
    const updated = store.notifications.filter((n) => n.id !== id);
    const newState = { ...store, notifications: updated };
    saveStore(newState);
    setStore(newState);
    onRefreshCount();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle2 className="text-emerald-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="text-amber-500" />;
      case NotificationType.ERROR:
        return <AlertCircle className="text-rose-500" />;
      default:
        return <Info className="text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            Notification Center
          </h1>
          <p className="text-zinc-500 font-medium">
            Stay updated with your property events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center justify-center bg-blue-600/10 hover:bg-blue-600/20 px-5 py-3 rounded-xl border border-blue-600/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 mr-2" /> Mark All Read
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search notifications..."
          className="glass-input w-full pl-14 pr-6 py-5 rounded-[2rem] text-sm font-bold outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group p-6 rounded-[2.5rem] border transition-all hover:scale-[1.01] flex flex-col sm:flex-row items-start gap-4 sm:gap-6 ${notification.isRead ? "bg-white/5 border-white/5 opacity-60" : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/10 shadow-xl shadow-blue-900/5"}`}
            >
              <div
                className={`p-4 rounded-2xl shrink-0 ${notification.isRead ? "bg-zinc-100 dark:bg-black/40" : "bg-blue-600/10 shadow-sm"}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className={`text-lg font-black tracking-tight flex items-center gap-2 ${notification.isRead ? "text-zinc-500" : "text-zinc-900 dark:text-white"}`}
                  >
                    {notification.title}
                    {!notification.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    )}
                  </h4>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap ml-4">
                    {getTimeAgo(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium mb-5 whitespace-pre-wrap break-words">
                  {notification.message}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {notification.linkTo && (
                    <button
                      onClick={() => onNavigate(notification.linkTo!)}
                      className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1.5"
                    >
                      View Context <ArrowRight size={14} />
                    </button>
                  )}
                  {notification.attachmentUrl && (
                    <a
                      href={notification.attachmentUrl}
                      download
                      className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 hover:underline uppercase tracking-widest"
                    >
                      <Download size={14} /> Download Dossier
                    </a>
                  )}
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-[10px] font-black text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors"
                    >
                      Mark Seen
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(notification.id)}
                className="sm:opacity-0 group-hover:opacity-100 p-3 text-zinc-300 hover:text-rose-500 transition-all rounded-xl mt-2 sm:mt-0 self-end sm:self-start"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-zinc-50/50 dark:bg-black/20 rounded-[4rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <Bell className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-zinc-400 uppercase tracking-widest">
              Void Inbox
            </h3>
            <p className="text-zinc-400 text-sm font-medium mt-2">
              Zero pending alerts in your lifecycle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
