import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';
import {
  Zap, TrendingDown, AlertTriangle, Flag, Flame, CheckCircle2,
  MapPin, Camera, Send, X,
} from 'lucide-react';
import type { State, Lga, Community, ReportType } from '@/types';

const REPORT_TYPES: { value: ReportType; label: string; icon: typeof Zap; color: string }[] = [
  { value: 'outage', label: 'Power Outage', icon: Zap, color: 'red' },
  { value: 'low_voltage', label: 'Low Voltage', icon: TrendingDown, color: 'yellow' },
  { value: 'transformer_fault', label: 'Transformer Fault', icon: Zap, color: 'orange' },
  { value: 'fallen_pole', label: 'Fallen Pole', icon: Flag, color: 'red' },
  { value: 'sparks', label: 'Sparks', icon: Flame, color: 'orange' },
  { value: 'restored', label: 'Power Restored', icon: CheckCircle2, color: 'green' },
];

export function ReportPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reportType, setReportType] = useState<ReportType>('outage');
  const [stateName, setStateName] = useState(profile?.state ?? '');
  const [lgaName, setLgaName] = useState(profile?.lga ?? '');
  const [communityName, setCommunityName] = useState(profile?.community ?? '');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from('states').select('*').order('name');
      setStates(s as State[] ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!stateName) return;
    const state = states.find((s) => s.name === stateName);
    if (!state) return;
    (async () => {
      const { data: l } = await supabase.from('lgas').select('*').eq('state_id', state.id).order('name');
      setLgas(l as Lga[] ?? []);
      setLgaName('');
      setCommunityName('');
    })();
  }, [stateName, states]);

  useEffect(() => {
    if (!lgaName || !states.length) return;
    const state = states.find((s) => s.name === stateName);
    if (!state) return;
    const lga = lgas.find((l) => l.name === lgaName && l.state_id === state.id);
    if (!lga) return;
    (async () => {
      const { data: c } = await supabase.from('communities').select('*').eq('lga_id', lga.id).order('name');
      setCommunities(c as Community[] ?? []);
      setCommunityName('');
    })();
  }, [lgaName, lgas, states, stateName]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast('Geolocation not supported on this device', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast('Location captured', 'success');
      },
      () => toast('Could not get your location', 'error')
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For demo, we just store a placeholder URL. In production this would upload to Supabase Storage.
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    toast('Photo attached', 'success');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stateName || !lgaName || !communityName) {
      toast('Please select state, LGA, and community', 'error');
      return;
    }
    setSubmitting(true);
    const selectedCommunity = communities.find((c) => c.name === communityName);
    const { error } = await supabase.from('outage_reports').insert({
      community_id: selectedCommunity?.id ?? null,
      state: stateName,
      lga: lgaName,
      community: communityName,
      report_type: reportType,
      description,
      photo_url: photoUrl || null,
      latitude: gps?.lat ?? selectedCommunity?.latitude ?? null,
      longitude: gps?.lng ?? selectedCommunity?.longitude ?? null,
      report_date: date,
      report_time: time,
    });
    setSubmitting(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Report submitted! Thank you for contributing.', 'success');
      // Trigger notification to nearby users
      try {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-outage`;
        await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ report_id: '', community_name: communityName, state: stateName }),
        });
      } catch { /* best-effort */ }
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Report an Outage</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Help your community by reporting power issues in real time.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Report type */}
        <div>
          <label className="label">Report Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setReportType(t.value)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  reportType === t.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">State</label>
            <select value={stateName} onChange={(e) => setStateName(e.target.value)} required className="input">
              <option value="">Select state</option>
              {states.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">LGA</label>
            <select value={lgaName} onChange={(e) => setLgaName(e.target.value)} required disabled={!stateName} className="input disabled:opacity-50">
              <option value="">Select LGA</option>
              {lgas.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Community</label>
            <select value={communityName} onChange={(e) => setCommunityName(e.target.value)} required disabled={!lgaName} className="input disabled:opacity-50">
              <option value="">Select community</option>
              {communities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* GPS */}
        <div>
          <label className="label">GPS Location</label>
          <button type="button" onClick={getLocation} className="btn-secondary w-full">
            <MapPin className="h-4 w-4" />
            {gps ? `Captured: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'Capture my location'}
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what happened (e.g. power went off around 6pm, heard a loud bang from transformer...)"
            className="input resize-none"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="label">Upload Photo (optional)</label>
          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={photoUrl} alt="Report" className="w-full h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => setPhotoUrl('')} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:border-blue-400 transition-colors">
              <Camera className="h-8 w-8 text-slate-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Click to upload a photo</span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input" />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="input" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          Submit Report
        </button>
      </form>
    </div>
  );
}
