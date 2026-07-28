import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { SkeletonCard, EmptyState } from '@/components/ui/Feedback';
import { StatusBadge, REPORT_TYPE_LABELS } from '@/components/ui/Status';
import {
  DailyElectricityChart, WeeklyOutageChart, ReliabilityGauge, MostAffectedChart,
} from '@/components/charts/Charts';
import {
  Zap, Clock, AlertTriangle, TrendingUp, PiggyBank, MapPin, ArrowRight, Activity, Award,
} from 'lucide-react';
import type { ReactNode } from 'react';

function StatCard({
  icon, label, value, sub, accent = 'blue', onClick,
}: {
  icon: ReactNode; label: string; value: ReactNode; sub?: string;
  accent?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'; onClick?: () => void;
}) {
  const accents = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600',
    green: 'bg-green-50 dark:bg-green-950/40 text-green-600',
    yellow: 'bg-electric-50 dark:bg-electric-950/40 text-electric-600',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600',
  };
  return (
    <div
      onClick={onClick}
      className={`card p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { communities, reports, powerHistory, leaderboard, loading } = useDashboardData(profile?.community ?? null);

  const userCommunity = communities.find((c) => c.name === profile?.community) ?? communities[0];

  const dailyData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const h of powerHistory) {
      byDate.set(h.recorded_date, (byDate.get(h.recorded_date) ?? 0) + (h.has_power ? 1 : 0));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, hours]) => ({ day: new Date(day).toLocaleDateString('en', { weekday: 'short' }), hours }));
  }, [powerHistory]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => ({
      day: d,
      reports: reports.filter((r) => {
        const wd = new Date(r.created_at).getDay();
        return days[wd === 0 ? 6 : wd - 1] === d;
      }).length,
    }));
  }, [reports]);

  const mostAffected = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reports) {
      counts.set(r.community, (counts.get(r.community) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, reports: count }))
      .sort((a, b) => b.reports - a.reports)
      .slice(0, 5);
  }, [reports]);

  const nearbyReports = reports.slice(0, 6);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-10 w-64 skeleton mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Here's the power situation in {userCommunity?.name ?? 'your area'} today.
          </p>
        </div>
        <button onClick={() => navigate('/report')} className="btn-primary">
          <Zap className="h-4 w-4" /> Report Outage
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Current Community Status"
          value={userCommunity ? <StatusBadge status={userCommunity.status} /> : '—'}
          sub={userCommunity?.name}
          accent={userCommunity?.status === 'stable' ? 'green' : userCommunity?.status === 'unstable' ? 'yellow' : 'red'}
          onClick={() => navigate('/map')}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Today's Electricity Hours"
          value={userCommunity ? `${userCommunity.avg_electricity_hours}h` : '—'}
          sub="out of 24 hours"
          accent="blue"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Weekly Outages"
          value={weeklyData.reduce((s, d) => s + d.reports, 0)}
          sub="reports this week"
          accent="red"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Monthly Reliability Score"
          value={userCommunity ? `${userCommunity.reliability_score}%` : '—'}
          sub={userCommunity && userCommunity.reliability_score >= 70 ? 'Good' : userCommunity && userCommunity.reliability_score >= 45 ? 'Fair' : 'Poor'}
          accent={userCommunity && userCommunity.reliability_score >= 70 ? 'green' : userCommunity && userCommunity.reliability_score >= 45 ? 'yellow' : 'red'}
        />
        <StatCard
          icon={<PiggyBank className="h-5 w-5" />}
          label="Generator Cost Saved"
          value="₦45,000"
          sub="est. monthly savings"
          accent="green"
          onClick={() => navigate('/calculators')}
        />
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Reports Near You"
          value={reports.length}
          sub="in your area"
          accent="purple"
          onClick={() => navigate('/map')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Daily Electricity Trend" action={<span className="text-xs text-slate-400">Last 7 days</span>}>
          {dailyData.length > 0 ? <DailyElectricityChart data={dailyData} /> : <EmptyState icon={<Activity />} title="No data yet" description="Power history will appear as reports come in." />}
        </ChartCard>
        <ChartCard title="Weekly Outage Reports">
          <WeeklyOutageChart data={weeklyData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Reliability Score">
          <ReliabilityGauge score={userCommunity?.reliability_score ?? 0} />
        </ChartCard>
        <div className="lg:col-span-2">
          <ChartCard title="Most Affected Communities">
            {mostAffected.length > 0 ? <MostAffectedChart data={mostAffected} /> : <EmptyState icon={<MapPin />} title="No reports yet" description="Affected communities will appear here." />}
          </ChartCard>
        </div>
      </div>

      {/* Recent reports + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent Reports</h3>
            <button onClick={() => navigate('/map')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {nearbyReports.length > 0 ? (
            <div className="space-y-3">
              {nearbyReports.map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${r.report_type === 'restored' ? 'bg-green-50 dark:bg-green-950/40 text-green-600' : 'bg-red-50 dark:bg-red-950/40 text-red-600'}`}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{r.community}, {r.state}</span>
                    </div>
                    {r.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{r.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Zap />} title="No reports yet" description="Be the first to report an outage in your area." action={<button onClick={() => navigate('/report')} className="btn-primary">Report Outage</button>} />
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Top Communities</h3>
            <Award className="h-4 w-4 text-electric-500" />
          </div>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((lb, i) => (
              <div key={lb.id} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-electric-100 text-electric-700 dark:bg-electric-900/40 dark:text-electular-300' : i === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{lb.community}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{lb.state}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">{lb.reliability_score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
