import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { ReliabilityGauge } from '@/components/charts/Charts';
import { Brain, Zap, Clock, Sun, TrendingUp, Activity } from 'lucide-react';
import type { Community, OutageReport, PowerHistoryEntry } from '@/types';

export function PredictionPage() {
  const { navigate } = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState<Community | null>(null);
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [history, setHistory] = useState<PowerHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: r }] = await Promise.all([
        supabase.from('communities').select('*').order('name'),
        supabase.from('outage_reports').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      setCommunities(c as Community[] ?? []);
      setReports(r as OutageReport[] ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data: h } = await supabase
        .from('power_history')
        .select('*')
        .eq('community_id', selected.id)
        .order('recorded_date', { ascending: true })
        .order('hour', { ascending: true });
      setHistory(h as PowerHistoryEntry[] ?? []);
    })();
  }, [selected]);

  // AI prediction logic based on historical data
  const prediction = useMemo(() => {
    if (!selected) return null;

    const recentReports = reports.filter((r) => r.community === selected.name && r.report_type !== 'restored');
    const todayReports = recentReports.filter((r) => r.report_date === new Date().toISOString().slice(0, 10));

    // Calculate outage probability from history
    const todayHistory = history.filter((h) => h.recorded_date === new Date().toISOString().slice(0, 10));
    const powerHoursToday = todayHistory.filter((h) => h.has_power).length;
    const outageProbability = Math.min(95, Math.max(5,
      Math.round(100 - selected.reliability_score + (todayReports.length * 5))
    ));

    // Best hours for electricity (from history)
    const hourPower = new Map<number, { power: number; total: number }>();
    for (const h of history) {
      const e = hourPower.get(h.hour) ?? { power: 0, total: 0 };
      e.total++;
      if (h.has_power) e.power++;
      hourPower.set(h.hour, e);
    }
    const bestHours = Array.from(hourPower.entries())
      .map(([h, e]) => ({ hour: h, rate: e.total > 0 ? (e.power / e.total) * 100 : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 4)
      .map((x) => `${x.hour}:00 - ${x.hour + 1}:00`);

    // Expected restoration
    const expectedRestoration = Math.round((100 - selected.reliability_score) / 15 + 2);

    return {
      outageProbability,
      expectedRestoration,
      bestHours: bestHours.length > 0 ? bestHours : ['11 PM - 5 AM', '11 AM - 1 PM'],
      reliability: selected.reliability_score,
      powerHoursToday,
    };
  }, [selected, reports, history]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Power Prediction</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered estimates based on community data.</p>
        </div>
      </div>

      {/* Community selector */}
      <div className="card p-4 mb-6">
        <label className="label">Select your community</label>
        <select
          value={selected?.id ?? ''}
          onChange={(e) => setSelected(communities.find((c) => c.id === e.target.value) ?? null)}
          className="input"
        >
          <option value="">Choose a community</option>
          {communities.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.name}</option>)}
        </select>
      </div>

      {selected && prediction ? (
        <div className="space-y-4 animate-scale-in">
          {/* Probability gauge */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Outage Probability Today</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48">
                  <ReliabilityGauge score={prediction.outageProbability} />
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 mt-2">
                {prediction.outageProbability >= 60 ? 'High likelihood of outage' : prediction.outageProbability >= 30 ? 'Moderate risk' : 'Low risk'}
              </p>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Today's Predictions</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Expected Restoration</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{prediction.expectedRestoration} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <Zap className="h-5 w-5 text-electric-500" />
                  <div>
                    <p className="text-xs text-slate-500">Power Hours Today</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{prediction.powerHoursToday || selected.avg_electricity_hours} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500">Reliability Score</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{prediction.reliability}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best hours */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-5 w-5 text-electric-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Best Hours for Electricity</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {prediction.bestHours.map((h, i) => (
                <div key={i} className="rounded-xl bg-gradient-to-br from-blue-50 to-electric-50 dark:from-blue-950/40 dark:to-electric-950/40 p-4 text-center">
                  <p className="text-xs text-slate-500">Slot {i + 1}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{h}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly forecast */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">24-Hour Power Forecast</h3>
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 24 }, (_, h) => {
                const histEntry = history.find((x) => x.hour === h);
                const hasPower = histEntry ? histEntry.has_power : h >= 22 || h <= 5 || (h >= 11 && h <= 13);
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-all ${hasPower ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-slate-200 dark:bg-slate-800'}`}
                      style={{ height: hasPower ? '100%' : '20%' }}
                      title={`${h}:00 - ${hasPower ? 'Power' : 'No power'}`}
                    />
                    {h % 6 === 0 && <span className="text-[10px] text-slate-400">{h}h</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-blue-500" /> <span className="text-slate-500">Power expected</span></div>
              <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-700" /> <span className="text-slate-500">Outage likely</span></div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Activity className="h-6 w-6" />}
          title="Select a community"
          description="Choose your community to see AI-powered power predictions, including outage probability, restoration estimates, and best electricity hours."
        />
      )}
    </div>
  );
}
