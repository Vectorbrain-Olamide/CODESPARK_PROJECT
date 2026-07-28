import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { REPORT_TYPE_LABELS } from '@/components/ui/Status';
import { Shield, Check, X, Trash2, Search, FileDown, Users, MapPin, BarChart3 } from 'lucide-react';
import type { OutageReport, Profile, Community } from '@/types';

export function AdminPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reports' | 'users' | 'communities'>('reports');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    (async () => {
      const [{ data: r }, { data: u }, { data: c }] = await Promise.all([
        supabase.from('outage_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('communities').select('*').order('name'),
      ]);
      setReports(r as OutageReport[] ?? []);
      setUsers(u as Profile[] ?? []);
      setCommunities(c as Community[] ?? []);
      setLoading(false);
    })();
  }, [profile, navigate]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('outage_reports').update({ status }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    toast(`Report ${status}`, 'success');
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from('outage_reports').delete().eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast('Report deleted', 'success');
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'State', 'LGA', 'Community', 'Description', 'Status'];
    const rows = reports.map((r) => [r.report_date, r.report_type, r.state, r.lga, r.community, r.description ?? '', r.status]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'admin-reports.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.community.toLowerCase().includes(q) || r.state.toLowerCase().includes(q) || r.report_type.toLowerCase().includes(q);
  });

  const stats = [
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Total Reports', value: reports.length },
    { icon: <Check className="h-5 w-5" />, label: 'Approved', value: reports.filter((r) => r.status === 'approved').length },
    { icon: <Users className="h-5 w-5" />, label: 'Users', value: users.length },
    { icon: <MapPin className="h-5 w-5" />, label: 'Communities', value: communities.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage reports, users, and communities.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2 text-slate-400">{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTab('reports')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'reports' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>Reports</button>
        <button onClick={() => setTab('users')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>Users</button>
        <button onClick={() => setTab('communities')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'communities' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>Communities</button>
        {tab === 'reports' && (
          <button onClick={exportCSV} className="btn-secondary ml-auto"><FileDown className="h-4 w-4" /> Export CSV</button>
        )}
      </div>

      {tab === 'reports' && (
        <div className="card p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="input pl-10" />
          </div>
          {filteredReports.length > 0 ? (
            <div className="space-y-2">
              {filteredReports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}</span>
                      <span className={`badge ${r.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : r.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{r.community}, {r.state} · {new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(r.id, 'approved')} className="p-2 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/60" title="Approve"><Check className="h-4 w-4" /></button>
                    <button onClick={() => updateStatus(r.id, 'rejected')} className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/60" title="Reject"><X className="h-4 w-4" /></button>
                    <button onClick={() => deleteReport(r.id)} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<BarChart3 />} title="No reports" description="No reports match your search." />
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card p-5">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{u.full_name?.[0] ?? 'U'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{u.state ?? '—'}</p>
                    {u.is_admin && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Admin</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Users />} title="No users" description="No users have signed up yet." />
          )}
        </div>
      )}

      {tab === 'communities' && (
        <div className="card p-5">
          {communities.length > 0 ? (
            <div className="space-y-2">
              {communities.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.reports_today} reports today · {c.reliability_score}% reliability</p>
                  </div>
                  <span className={`badge ${c.status === 'stable' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : c.status === 'unstable' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<MapPin />} title="No communities" description="No communities configured." />
          )}
        </div>
      )}
    </div>
  );
}
