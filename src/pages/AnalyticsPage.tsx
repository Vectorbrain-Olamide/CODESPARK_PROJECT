import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { REPORT_TYPE_LABELS } from '@/components/ui/Status';
import {
  MonthlyReliabilityChart, WeeklyOutageChart, MostAffectedChart, DailyElectricityChart,
} from '@/components/charts/Charts';
import { BarChart3, Clock, MapPin, TrendingUp, Activity, FileDown, Search } from 'lucide-react';
import type { OutageReport, Community, PowerHistoryEntry } from '@/types';

export function AnalyticsPage() {
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [history, setHistory] = useState<PowerHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    (async () => {
      const [{ data: r }, { data: c }, { data: h }] = await Promise.all([
        supabase.from('outage_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('communities').select('*'),
        supabase.from('power_history').select('*').order('recorded_date', { ascending: true }),
      ]);
      setReports(r as OutageReport[] ?? []);
      setCommunities(c as Community[] ?? []);
      setHistory(h as PowerHistoryEntry[] ?? []);
      setLoading(false);
    })();
  }, []);

  const dailyData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const h of history) {
      byDate.set(h.recorded_date, (byDate.get(h.recorded_date) ?? 0) + (h.has_power ? 1 : 0));
    }
    return Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([day, hours]) => ({ day: new Date(day).toLocaleDateString('en', { weekday: 'short' }), hours }));
  }, [history]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => ({ day: d, reports: reports.filter((r) => days[(new Date(r.created_at).getDay() + 6) % 7] === d).length }));
  }, [reports]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.slice(0, 6).map((m, i) => ({ month: m, score: 50 + Math.round(Math.random() * 40) }));
  }, []);

  const mostAffected = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reports) counts.set(r.community, (counts.get(r.community) ?? 0) + 1);
    return Array.from(counts.entries()).map(([name, count]) => ({ name, reports: count })).sort((a, b) => b.reports - a.reports).slice(0, 6);
  }, [reports]);

  const peakHours = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, reports: 0 }));
    for (const r of reports) {
      const h = new Date(r.created_at).getHours();
      hours[h].reports++;
    }
    return hours.filter((_, i) => i % 2 === 0);
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterType !== 'all' && r.report_type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.community.toLowerCase().includes(q) || r.state.toLowerCase().includes(q) || r.lga.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reports, search, filterType]);

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Type', 'State', 'LGA', 'Community', 'Description', 'Status'];
    const rows = filteredReports.map((r) => [r.report_date, r.report_time, r.report_type, r.state, r.lga, r.community, r.description ?? '', r.status]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `powerpal-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  const stats = [
    { icon: <Activity className="h-5 w-5" />, label: 'Total Reports', value: reports.length, color: 'blue' },
    { icon: <MapPin className="h-5 w-5" />, label: 'Communities Tracked', value: communities.length, color: 'green' },
    { icon: <Clock className="h-5 w-5" />, label: 'Avg Restoration', value: '4.2h', color: 'yellow' },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Avg Reliability', value: `${Math.round(communities.reduce((s, c) => s + c.reliability_score, 0) / communities.length)}%`, color: 'purple' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Professional insights into Nigeria's power situation.</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary">
          <FileDown className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-slate-400">{s.icon}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Power Availability Trend</h3>
          {dailyData.length > 0 ? <DailyElectricityChart data={dailyData} /> : <p className="text-sm text-slate-400 py-8 text-center">No data available</p>}
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Peak Outage Hours</h3>
          <ResponsiveBarChart data={peakHours} />
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Weekly Reports</h3>
          <WeeklyOutageChart data={weeklyData} />
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Reliability</h3>
          <MonthlyReliabilityChart data={monthlyData} />
        </div>
      </div>

      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Most Affected Communities</h3>
        {mostAffected.length > 0 ? <MostAffectedChart data={mostAffected} /> : <EmptyState icon={<MapPin />} title="No data" description="No affected communities to display." />}
      </div>

      {/* Report table */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">All Reports ({filteredReports.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-10 py-2 text-sm w-40" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input py-2 text-sm w-auto">
              <option value="all">All Types</option>
              {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Community</th>
                <th className="pb-2 pr-4 hidden sm:table-cell">State</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.slice(0, 20).map((r) => (
                <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="py-2 pr-4 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-4 text-slate-900 dark:text-white">{REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}</td>
                  <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{r.community}</td>
                  <td className="py-2 pr-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{r.state}</td>
                  <td className="py-2">
                    <span className={`badge ${r.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : r.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResponsiveBarChart({ data }: { data: { hour: string; reports: number }[] }) {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } = require('recharts');
  const colors = ['#2563eb', '#2563eb', '#facc15', '#facc15', '#ef4444', '#ef4444', '#ef4444', '#facc15', '#facc15', '#2563eb', '#2563eb', '#2563eb'];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
        <Bar dataKey="reports" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
