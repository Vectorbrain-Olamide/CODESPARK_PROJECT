import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Feedback';
import { User as UserIcon, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import type { State, Lga, Community } from '@/types';

export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone_number ?? '');
  const [stateName, setStateName] = useState(profile?.state ?? '');
  const [lgaName, setLgaName] = useState(profile?.lga ?? '');
  const [communityName, setCommunityName] = useState(profile?.community ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from('states').select('*').order('name');
      setStates(s as State[] ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!stateName) return;
    const state = states.find((s) => s.name === stateName);
    if (!state) return;
    (async () => {
      const { data: l } = await supabase.from('lgas').select('*').eq('state_id', state.id).order('name');
      setLgas(l as Lga[] ?? []);
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
    })();
  }, [lgaName, lgas, states, stateName]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast('Profile photo updated', 'success');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      phone_number: phone,
      state: stateName,
      lga: lgaName,
      community: communityName,
      avatar_url: avatarUrl,
    });
    setSaving(false);
    toast(error ? error : 'Profile updated successfully!', error ? 'error' : 'success');
  };

  if (!profile) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h1>

      <form onSubmit={handleSave} className="card p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {fullName?.[0]?.toUpperCase() ?? <UserIcon className="h-8 w-8" />}
              </div>
            )}
            <label className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{fullName || 'Your name'}</p>
            <p className="text-xs text-slate-500">{profile.email}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-10" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={profile.email ?? ''} disabled className="input pl-10 opacity-60" />
            </div>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." className="input pl-10" />
            </div>
          </div>
          <div>
            <label className="label">State</label>
            <select value={stateName} onChange={(e) => setStateName(e.target.value)} className="input">
              <option value="">Select state</option>
              {states.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">LGA</label>
            <select value={lgaName} onChange={(e) => setLgaName(e.target.value)} disabled={!stateName} className="input disabled:opacity-50">
              <option value="">Select LGA</option>
              {lgas.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Community</label>
            <select value={communityName} onChange={(e) => setCommunityName(e.target.value)} disabled={!lgaName} className="input disabled:opacity-50">
              <option value="">Select community</option>
              {communities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
