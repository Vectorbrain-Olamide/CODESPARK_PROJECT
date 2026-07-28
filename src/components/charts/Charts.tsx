import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';

const axisColor = { light: '#94a3b8', dark: '#64748b' };

function useChartColors() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    axis: isDark ? axisColor.dark : axisColor.light,
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#1e293b' : '#e2e8f0',
    tooltipText: isDark ? '#f1f5f9' : '#0f172a',
  };
}

export function DailyElectricityChart({ data }: { data: { day: string; hours: number }[] }) {
  const c = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} domain={[0, 24]} />
        <Tooltip contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 12, fontSize: 12, color: c.tooltipText }} />
        <Area type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2.5} fill="url(#elecGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WeeklyOutageChart({ data }: { data: { day: string; reports: number }[] }) {
  const c = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 12, fontSize: 12, color: c.tooltipText }} />
        <Bar dataKey="reports" fill="#facc15" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyReliabilityChart({ data }: { data: { month: string; score: number }[] }) {
  const c = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 12, fontSize: 12, color: c.tooltipText }} />
        <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MostAffectedChart({ data }: { data: { name: string; reports: number }[] }) {
  const c = useChartColors();
  const colors = ['#ef4444', '#f97316', '#facc15', '#2563eb', '#22c55e'];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: c.axis }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: c.axis }} axisLine={false} tickLine={false} width={90} />
        <Tooltip contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 12, fontSize: 12, color: c.tooltipText }} />
        <Bar dataKey="reports" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReliabilityGauge({ score }: { score: number }) {
  const c = useChartColors();
  const data = [{ name: 'score', value: score, fill: score >= 70 ? '#22c55e' : score >= 45 ? '#facc15' : '#ef4444' }];
  return (
    <ResponsiveContainer width="100%" height={160}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar background={{ fill: c.grid }} dataKey="value" cornerRadius={10} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 dark:fill-white" style={{ fontSize: 28, fontWeight: 700 }}>
          {score}%
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export function useDailyElectricityData(powerHistory: { recorded_date: string; hour: number; has_power: boolean }[]) {
  return useMemo(() => {
    const byDate = new Map<string, number>();
    for (const h of powerHistory) {
      const d = h.recorded_date;
      byDate.set(d, (byDate.get(d) ?? 0) + (h.has_power ? 1 : 0));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, hours]) => ({
        day: new Date(day).toLocaleDateString('en', { weekday: 'short' }),
        hours,
      }));
  }, [powerHistory]);
}
