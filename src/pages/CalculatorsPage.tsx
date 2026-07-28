import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';
import { Calculator, Fuel, Battery, Sun, Zap, Clock, PiggyBank, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

type Tab = 'generator' | 'inverter';

export function CalculatorsPage() {
  const [tab, setTab] = useState<Tab>('generator');
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Cost Calculators</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Estimate your generator fuel costs and inverter sizing.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('generator')}
          className={`flex-1 rounded-xl p-3 text-sm font-medium transition-all ${tab === 'generator' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          <Fuel className="h-4 w-4 inline mr-2" /> Generator Cost
        </button>
        <button
          onClick={() => setTab('inverter')}
          className={`flex-1 rounded-xl p-3 text-sm font-medium transition-all ${tab === 'inverter' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          <Battery className="h-4 w-4 inline mr-2" /> Inverter Sizing
        </button>
      </div>

      {tab === 'generator' ? <GeneratorCalculator /> : <InverterCalculator />}
    </div>
  );
}

function ResultCard({ icon, label, value, accent = 'blue' }: { icon: ReactNode; label: string; value: string; accent?: 'blue' | 'green' | 'yellow' | 'red' }) {
  const accents = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600',
    green: 'bg-green-50 dark:bg-green-950/40 text-green-600',
    yellow: 'bg-electric-50 dark:bg-electric-950/40 text-electric-600',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600',
  };
  return (
    <div className="card p-4 animate-scale-in">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]} mb-3`}>{icon}</div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function GeneratorCalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [genSize, setGenSize] = useState('2.5');
  const [fuelCons, setFuelCons] = useState('1.5');
  const [fuelPrice, setFuelPrice] = useState('850');
  const [hours, setHours] = useState('6');
  const [results, setResults] = useState<{ daily: number; weekly: number; monthly: number; yearly: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const calculate = (e: FormEvent) => {
    e.preventDefault();
    const daily = parseFloat(fuelCons) * parseFloat(fuelPrice) * parseFloat(hours);
    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = daily * 365;
    setResults({ daily, weekly, monthly, yearly });
  };

  const saveCalc = async () => {
    if (!user || !results) return;
    setSaving(true);
    const { error } = await supabase.from('generator_calculations').insert({
      user_id: user.id,
      generator_size: parseFloat(genSize),
      fuel_consumption: parseFloat(fuelCons),
      fuel_price: parseFloat(fuelPrice),
      hours_per_day: parseFloat(hours),
      daily_cost: results.daily,
      weekly_cost: results.weekly,
      monthly_cost: results.monthly,
      yearly_cost: results.yearly,
    });
    setSaving(false);
    toast(error ? error.message : 'Calculation saved!', error ? 'error' : 'success');
  };

  const fmt = (n: number) => `₦${n.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={calculate} className="card p-6 space-y-4">
        <div>
          <label className="label">Generator Size (kVA)</label>
          <input type="number" step="0.1" value={genSize} onChange={(e) => setGenSize(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Fuel Consumption (litres/hour)</label>
          <input type="number" step="0.1" value={fuelCons} onChange={(e) => setFuelCons(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Fuel Price (₦/litre)</label>
          <input type="number" step="10" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Hours Used Per Day</label>
          <input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="input" />
        </div>
        <button type="submit" className="btn-primary w-full">
          <Calculator className="h-4 w-4" /> Calculate
        </button>
      </form>

      <div>
        {results ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard icon={<Clock className="h-5 w-5" />} label="Daily Cost" value={fmt(results.daily)} accent="blue" />
              <ResultCard icon={<TrendingUp className="h-5 w-5" />} label="Weekly Cost" value={fmt(results.weekly)} accent="yellow" />
              <ResultCard icon={<Fuel className="h-5 w-5" />} label="Monthly Cost" value={fmt(results.monthly)} accent="red" />
              <ResultCard icon={<PiggyBank className="h-5 w-5" />} label="Yearly Cost" value={fmt(results.yearly)} accent="green" />
            </div>
            <div className="card p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Switching to solar could save you <span className="font-bold">{fmt(results.yearly * 0.7)}</span> per year!
                </p>
              </div>
            </div>
            {user && (
              <button onClick={saveCalc} disabled={saving} className="btn-secondary w-full">
                {saving ? <Spinner className="h-4 w-4" /> : null} Save Calculation
              </button>
            )}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Fuel className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter your generator details and click Calculate to see cost estimates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const APPLIANCES = [
  { key: 'tv', label: 'TV', watts: 120, defaultQty: 1 },
  { key: 'fan', label: 'Fan', watts: 70, defaultQty: 2 },
  { key: 'lights', label: 'Lights', watts: 15, defaultQty: 5 },
  { key: 'laptop', label: 'Laptop', watts: 65, defaultQty: 1 },
  { key: 'router', label: 'Router', watts: 20, defaultQty: 1 },
  { key: 'fridge', label: 'Fridge', watts: 200, defaultQty: 1 },
  { key: 'freezer', label: 'Freezer', watts: 250, defaultQty: 0 },
  { key: 'ac', label: 'Air Conditioner', watts: 1200, defaultQty: 0 },
];

function InverterCalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(APPLIANCES.map((a) => [a.key, a.defaultQty]))
  );
  const [backupHours, setBackupHours] = useState('8');
  const [results, setResults] = useState<{ inverterSize: number; batteryCapacity: number; backup: number; solarPanel: number; monthlyUsage: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const calculate = (e: FormEvent) => {
    e.preventDefault();
    const totalWatts = APPLIANCES.reduce((sum, a) => sum + a.watts * (quantities[a.key] ?? 0), 0);
    const inverterSize = Math.ceil((totalWatts * 1.3) / 1000 * 10) / 10; // 30% surge factor, in kVA
    const batteryCapacity = Math.ceil((totalWatts * parseFloat(backupHours)) / 12 / 0.8); // 12V system, 80% DoD
    const solarPanel = Math.ceil(totalWatts * 1.5 / 100) * 100; // watts, rounded to 100
    const monthlyUsage = (totalWatts * parseFloat(backupHours) * 30) / 1000; // kWh
    setResults({ inverterSize, batteryCapacity, backup: parseFloat(backupHours), solarPanel, monthlyUsage });
  };

  const saveCalc = async () => {
    if (!user || !results) return;
    setSaving(true);
    const { error } = await supabase.from('inverter_calculations').insert({
      user_id: user.id,
      appliances: quantities,
      inverter_size: results.inverterSize,
      battery_capacity: results.batteryCapacity,
      backup_hours: results.backup,
      solar_panel_size: results.solarPanel,
      monthly_usage: results.monthlyUsage,
    });
    setSaving(false);
    toast(error ? error.message : 'Calculation saved!', error ? 'error' : 'success');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={calculate} className="card p-6 space-y-4">
        <div>
          <label className="label">Your Appliances</label>
          <div className="space-y-2">
            {APPLIANCES.map((a) => (
              <div key={a.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{a.label}</p>
                  <p className="text-xs text-slate-400">{a.watts}W each</p>
                </div>
                <input
                  type="number"
                  min="0"
                  value={quantities[a.key] ?? 0}
                  onChange={(e) => setQuantities({ ...quantities, [a.key]: parseInt(e.target.value) || 0 })}
                  className="input w-20 text-center"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Desired Backup Time (hours)</label>
          <input type="number" step="1" value={backupHours} onChange={(e) => setBackupHours(e.target.value)} className="input" />
        </div>
        <button type="submit" className="btn-primary w-full">
          <Calculator className="h-4 w-4" /> Calculate
        </button>
      </form>

      <div>
        {results ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard icon={<Zap className="h-5 w-5" />} label="Required Inverter Size" value={`${results.inverterSize} kVA`} accent="blue" />
              <ResultCard icon={<Battery className="h-5 w-5" />} label="Battery Capacity" value={`${results.batteryCapacity} Ah`} accent="yellow" />
              <ResultCard icon={<Clock className="h-5 w-5" />} label="Estimated Backup" value={`${results.backup} hours`} accent="green" />
              <ResultCard icon={<Sun className="h-5 w-5" />} label="Recommended Solar" value={`${results.solarPanel} W`} accent="yellow" />
            </div>
            <ResultCard icon={<TrendingUp className="h-5 w-5" />} label="Monthly Energy Usage" value={`${results.monthlyUsage.toFixed(1)} kWh`} accent="blue" />
            {user && (
              <button onClick={saveCalc} disabled={saving} className="btn-secondary w-full">
                {saving ? <Spinner className="h-4 w-4" /> : null} Save Calculation
              </button>
            )}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Battery className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Select your appliances and click Calculate to see inverter sizing recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
