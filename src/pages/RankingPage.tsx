import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { Crown, Medal, Award, TrendingUp, Clock, Shield } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

type SortKey = 'reliability_score' | 'avg_restoration_hours' | 'total_outages';

export function RankingPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('reliability_score');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('leaderboard').select('*');
      setEntries(data as LeaderboardEntry[] ?? []);
      setLoading(false);
    })();
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (sortKey === 'reliability_score') return b.reliability_score - a.reliability_score;
    if (sortKey === 'avg_restoration_hours') return a.avg_restoration_hours - b.avg_restoration_hours;
    return a.total_outages - b.total_outages;
  });

  const getRankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-electric-500" />;
    if (i === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (i === 2) return <Award className="h-5 w-5 text-orange-500" />;
    return <span className="text-sm font-bold text-slate-400">{i + 1}</span>;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Community Ranking</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">See which communities have the best electricity supply.</p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSortKey('reliability_score')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${sortKey === 'reliability_score' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          <TrendingUp className="h-4 w-4" /> Most Reliable
        </button>
        <button
          onClick={() => setSortKey('avg_restoration_hours')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${sortKey === 'avg_restoration_hours' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          <Clock className="h-4 w-4" /> Fastest Restoration
        </button>
        <button
          onClick={() => setSortKey('total_outages')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${sortKey === 'total_outages' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          <Shield className="h-4 w-4" /> Fewest Outages
        </button>
      </div>

      {/* Podium for top 3 */}
      {sorted.length >= 3 && sortKey === 'reliability_score' && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 0, 2].map((idx) => {
            const e = sorted[idx];
            const heights = ['h-32', 'h-40', 'h-28'];
            const order = idx === 0 ? 1 : idx === 1 ? 0 : 2;
            return (
              <div key={e.id} className={`flex flex-col items-center ${order === 1 ? 'order-1' : order === 0 ? 'order-2' : 'order-3'}`}>
                {idx === 0 && <Crown className="h-8 w-8 text-electric-500 mb-2 animate-float" />}
                <div className={`${heights[idx]} w-full rounded-2xl flex flex-col items-center justify-end p-4 ${idx === 0 ? 'bg-gradient-to-b from-electric-100 to-electric-200 dark:from-electular-900/40 dark:to-electular-900/20' : idx === 1 ? 'bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700' : 'bg-gradient-to-b from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-900/20'}`}>
                  <p className="text-sm font-bold text-slate-900 dark:text-white text-center truncate w-full">{e.community}</p>
                  <p className="text-xs text-slate-500 mt-1">{e.reliability_score}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {sorted.length > 0 ? (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {sorted.map((e, i) => (
            <div key={e.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                {getRankIcon(i)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{e.community}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{e.state} · {e.lga}</p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-xs text-slate-400">Reliability</p>
                  <p className="text-sm font-bold text-blue-600">{e.reliability_score}%</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-slate-400">Restore</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{e.avg_restoration_hours}h</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-slate-400">Outages</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{e.total_outages}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<TrendingUp />} title="No rankings yet" description="Rankings will appear once communities have enough data." />
      )}
    </div>
  );
}
