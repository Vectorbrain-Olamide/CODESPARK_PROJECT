import { PowerStatus } from '@/types';

export function StatusDot({ status, size = 'md' }: { status: PowerStatus; size?: 'sm' | 'md' | 'lg' }) {
  const colors: Record<PowerStatus, string> = {
    stable: 'bg-green-500',
    unstable: 'bg-yellow-400',
    outage: 'bg-red-500',
  };
  const sizes = { sm: 'h-2 w-2', md: 'h-3 w-3', lg: 'h-4 w-4' };
  return (
    <span className="relative flex">
      <span className={`${sizes[size]} ${colors[status]} rounded-full`} />
      {status === 'outage' && (
        <span className={`absolute inline-flex ${sizes[size]} rounded-full bg-red-400 opacity-75 animate-ping`} />
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: PowerStatus }) {
  const config: Record<PowerStatus, { label: string; classes: string }> = {
    stable: { label: 'Stable', classes: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    unstable: { label: 'Unstable', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    outage: { label: 'Outage', classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  };
  const c = config[status];
  return (
    <span className={`badge ${c.classes}`}>
      <StatusDot status={status} size="sm" />
      {c.label}
    </span>
  );
}

export const REPORT_TYPE_LABELS: Record<string, string> = {
  outage: 'Power Outage',
  low_voltage: 'Low Voltage',
  transformer_fault: 'Transformer Fault',
  fallen_pole: 'Fallen Pole',
  sparks: 'Sparks',
  restored: 'Power Restored',
};

export const REPORT_TYPE_ICONS: Record<string, string> = {
  outage: 'PlugZap',
  low_voltage: 'TrendingDown',
  transformer_fault: 'Zap',
  fallen_pole: 'AlertTriangle',
  sparks: 'Flame',
  restored: 'CheckCircle2',
};
