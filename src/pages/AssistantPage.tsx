import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { Bot, Send, Sparkles, User as UserIcon, Trash2 } from 'lucide-react';
import type { AiChat, Community, OutageReport } from '@/types';

const SUGGESTED = [
  'Why has my area had frequent outages?',
  'When is power likely to return?',
  'Should I buy an inverter or generator?',
  'How can I reduce fuel costs?',
];

function generateResponse(question: string, community: Community | undefined, reports: OutageReport[]): string {
  const q = question.toLowerCase();

  if (q.includes('frequent') || q.includes('why') && q.includes('outage')) {
    if (community) {
      return `Based on community data for ${community.name}, your area has a reliability score of ${community.reliability_score}% with an average of ${community.avg_electricity_hours} hours of electricity per day. Frequent outages here are likely due to:\n\n1. Grid overload during peak hours (6-10 PM)\n2. Aging transformer infrastructure\n3. Load shedding by the distribution company\n\nConsider reporting each outage to help build a stronger case for infrastructure upgrades.`;
    }
    return 'Frequent outages are typically caused by grid overload, aging infrastructure, or scheduled load shedding. Report outages to help your community track patterns.';
  }

  if (q.includes('when') && (q.includes('return') || q.includes('back') || q.includes('come'))) {
    if (community) {
      const recent = reports.filter((r) => r.community === community.name).length;
      return `For ${community.name}, based on ${recent} recent reports and historical patterns, power typically returns within 2-6 hours of an outage. The best hours for electricity are usually 11 PM - 5 AM when grid demand is lowest.`;
    }
    return 'Power typically returns within 2-6 hours. Check the live map for the latest community reports.';
  }

  if (q.includes('inverter') || q.includes('generator')) {
    return `Great question! Here's a comparison:\n\n**Generator:**\n- Lower upfront cost (₦150k-500k)\n- High running cost (₦40k-80k/month in fuel)\n- Noisy, produces fumes\n\n**Inverter + Solar:**\n- Higher upfront cost (₦300k-1M)\n- Very low running cost\n- Silent, clean energy\n- Pays for itself in 1-2 years\n\nRecommendation: If you use power 6+ hours daily, an inverter system saves money long-term. Use the Cost Calculator to see your exact savings.`;
  }

  if (q.includes('fuel') || q.includes('cost') || q.includes('save')) {
    return `To reduce generator fuel costs:\n\n1. **Right-size your generator** - Don't run a 5kVA generator for just lights and TV\n2. **Use only when needed** - Switch off during grid power\n3. **Maintain regularly** - Clean filters and oil changes improve efficiency by 15-20%\n4. **Consider a hybrid** - Small inverter for evenings, generator for heavy loads\n5. **Switch to solar** - Can eliminate fuel costs entirely\n\nUse the Generator Calculator to see your exact monthly spend.`;
  }

  return `I'm PowerBot, your electricity assistant! I can help with:\n\n- Outage patterns and predictions for your area\n- Inverter vs generator recommendations\n- Fuel cost reduction tips\n- Best hours for electricity\n\nTry asking: "${SUGGESTED[Math.floor(Math.random() * SUGGESTED.length)]}"`;
}

export function AssistantPage() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<AiChat[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [community, setCommunity] = useState<Community | undefined>();
  const [reports, setReports] = useState<OutageReport[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const [{ data: c }, { data: r }, { data: comms }] = await Promise.all([
        supabase.from('ai_chats').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('outage_reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('communities').select('*'),
      ]);
      setChats(c as AiChat[] ?? []);
      setReports(r as OutageReport[] ?? []);
      setCommunity((comms as Community[])?.find((cm) => cm.name === profile?.community));
      setLoading(false);
    })();
  }, [user, profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chats, thinking]);

  const send = async (text: string) => {
    if (!user || !text.trim()) return;
    setInput('');
    setThinking(true);

    const userMsg: AiChat = { id: 'temp-u', user_id: user.id, role: 'user', content: text, created_at: new Date().toISOString() };
    setChats((prev) => [...prev, userMsg]);

    await supabase.from('ai_chats').insert({ user_id: user.id, role: 'user', content: text });

    setTimeout(async () => {
      const response = generateResponse(text, community, reports);
      const botMsg: AiChat = { id: 'temp-b', user_id: user.id, role: 'assistant', content: response, created_at: new Date().toISOString() };
      setChats((prev) => [...prev, botMsg]);
      setThinking(false);
      await supabase.from('ai_chats').insert({ user_id: user.id, role: 'assistant', content: response });
    }, 800);
  };

  const clearChats = async () => {
    if (!user) return;
    await supabase.from('ai_chats').delete().eq('user_id', user.id);
    setChats([]);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PowerBot</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your AI electricity assistant</p>
          </div>
        </div>
        {chats.length > 0 && (
          <button onClick={clearChats} className="btn-ghost text-red-500">
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div className="card flex flex-col" style={{ height: '60vh' }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {chats.length === 0 && !thinking ? (
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="Ask PowerBot anything"
              description="Get insights about outages, power predictions, and energy cost savings."
            />
          ) : (
            <>
              {chats.map((c) => (
                <div key={c.id} className={`flex gap-3 ${c.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-600 to-blue-800 text-white'}`}>
                    {c.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${c.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>
                    {c.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Suggested */}
        {chats.length === 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 dark:border-slate-800 p-3">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask PowerBot..."
              className="input flex-1"
            />
            <button type="submit" disabled={!input.trim() || thinking} className="btn-primary">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
