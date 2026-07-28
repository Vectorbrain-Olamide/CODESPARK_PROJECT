import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/context/ToastContext';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { StatusBadge, StatusDot, REPORT_TYPE_LABELS } from '@/components/ui/Status';
import { MapPin, Zap, X, Share2, Star, Search } from 'lucide-react';
import type { Community, OutageReport } from '@/types';

// Approximate lat/lng bounds for Nigeria
const NG_BOUNDS = { minLat: 4, maxLat: 14, minLng: 3, maxLng: 15 };

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - NG_BOUNDS.minLng) / (NG_BOUNDS.maxLng - NG_BOUNDS.minLng)) * w;
  const y = h - ((lat - NG_BOUNDS.minLat) / (NG_BOUNDS.maxLat - NG_BOUNDS.minLat)) * h;
  return { x, y };
}

export function LiveMapPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Community | null>(null);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: r }] = await Promise.all([
        supabase.from('communities').select('*'),
        supabase.from('outage_reports').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      setCommunities(c as Community[] ?? []);
      setReports(r as OutageReport[] ?? []);
      setLoading(false);
    })();
  }, []);

  const communityReports = useMemo(() => {
    if (!selected) return [];
    return reports.filter((r) => r.community === selected.name).slice(0, 5);
  }, [selected, reports]);

  const filtered = useMemo(() => {
    if (!search) return communities;
    const q = search.toLowerCase();
    return communities.filter((c) => c.name.toLowerCase().includes(q));
  }, [communities, search]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast(favorites.has(id) ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const shareReport = (r: OutageReport) => {
    const text = `PowerPal NG: ${REPORT_TYPE_LABELS[r.report_type] ?? r.report_type} reported in ${r.community}, ${r.state}`;
    if (navigator.share) {
      navigator.share({ title: 'PowerPal NG', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast('Report details copied', 'success');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Live Outage Map</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Real-time power status across Nigerian communities.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm"><StatusDot status="stable" /> <span className="text-slate-600 dark:text-slate-300">Stable</span></div>
        <div className="flex items-center gap-2 text-sm"><StatusDot status="unstable" /> <span className="text-slate-600 dark:text-slate-300">Unstable</span></div>
        <div className="flex items-center gap-2 text-sm"><StatusDot status="outage" /> <span className="text-slate-600 dark:text-slate-300">Outage</span></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card p-4 relative overflow-hidden">
            <svg viewBox="0 0 600 700" className="w-full h-auto" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)' }}>
              {/* Nigeria outline (simplified) */}
              <path
                d="M 180 80 L 280 70 L 380 90 L 440 140 L 470 200 L 500 260 L 520 340 L 500 420 L 460 480 L 420 540 L 360 580 L 280 600 L 200 580 L 140 540 L 100 480 L 80 400 L 90 320 L 110 240 L 140 160 Z"
                fill="#bfdbfe"
                fillOpacity={0.4}
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <text x="300" y="350" textAnchor="middle" className="fill-blue-300" style={{ fontSize: 48, fontWeight: 700, opacity: 0.3 }}>
                NIGERIA
              </text>

              {/* Community markers */}
              {communities.map((c) => {
                if (!c.latitude || !c.longitude) return null;
                const { x, y } = project(c.latitude, c.longitude, 600, 700);
                const color = c.status === 'stable' ? '#22c55e' : c.status === 'unstable' ? '#facc15' : '#ef4444';
                return (
                  <g key={c.id} onClick={() => setSelected(c)} className="cursor-pointer">
                    {c.status === 'outage' && (
                      <circle cx={x} cy={y} r={14} fill={color} opacity={0.3} className="animate-ping" />
                    )}
                    <circle cx={x} cy={y} r={favorites.has(c.id) ? 9 : 7} fill={color} stroke="white" strokeWidth={2} className="transition-all hover:r-10" />
                    <title>{c.name}</title>
                  </g>
                );
              })}
            </svg>

            {/* Search overlay */}
            <div className="absolute top-6 left-6 right-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search communities..."
                  className="input pl-10 py-2 text-sm glass-strong"
                />
              </div>
            </div>
          </div>

          {/* Community list */}
          <div className="mt-4 card p-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Communities ({filtered.length})</h3>
            <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={c.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate">{c.reports_today} reports today</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 shrink-0">{c.reliability_score}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="card p-5 sticky top-20 animate-scale-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selected.name}, {selected.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleFavorite(selected.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Star className={`h-4 w-4 ${favorites.has(selected.id) ? 'fill-electric-400 text-electric-400' : 'text-slate-400'}`} />
                  </button>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <StatusBadge status={selected.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-500">Reports Today</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selected.reports_today}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-500">Avg Electricity</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selected.avg_electricity_hours}h</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-500">Reliability</p>
                  <p className="text-xl font-bold text-blue-600">{selected.reliability_score}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(selected.last_updated).toLocaleDateString()}</p>
                </div>
              </div>

              <button onClick={() => navigate('/report')} className="btn-primary w-full mb-3">
                <Zap className="h-4 w-4" /> Report Outage Here
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Recent Reports</h4>
                {communityReports.length > 0 ? (
                  <div className="space-y-2">
                    {communityReports.map((r) => (
                      <div key={r.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white">{REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}</p>
                          <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={() => shareReport(r)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                          <Share2 className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No recent reports for this community.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <EmptyState
                icon={<MapPin className="h-6 w-6" />}
                title="Select a community"
                description="Click any marker on the map to see detailed power status and reports."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
