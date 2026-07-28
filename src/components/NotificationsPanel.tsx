import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { X, Bell, Zap, TrendingUp, FileText, Check } from 'lucide-react';
import type { Notification } from '@/types';

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data as Notification[] ?? []);
      setLoading(false);
    })();
  }, [open, user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    if (type === 'power_restored') return <Zap className="h-4 w-4 text-green-500" />;
    if (type === 'outage_nearby') return <Zap className="h-4 w-4 text-red-500" />;
    if (type === 'prediction_change') return <TrendingUp className="h-4 w-4 text-blue-500" />;
    if (type === 'weekly_report') return <FileText className="h-4 w-4 text-electric-500" />;
    return <Bell className="h-4 w-4 text-slate-400" />;
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm glass-strong border-l border-slate-200 dark:border-slate-800 animate-slide-up" style={{ animation: 'slideIn 0.3s ease-out' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <div className="flex gap-2">
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark all read</button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                        {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                      </div>
                      {n.body && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.body}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Check className="h-3 w-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <Bell className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
              <p className="text-xs text-slate-400 mt-1">You'll be notified when power changes in your area.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
