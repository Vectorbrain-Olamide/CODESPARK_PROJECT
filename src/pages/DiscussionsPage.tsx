import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { MessageSquare, Send, Pin, ArrowLeft } from 'lucide-react';
import type { Discussion, Community } from '@/types';

export function DiscussionsPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Discussion[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: c }] = await Promise.all([
        supabase.from('discussions').select('*').is('parent_id', null).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('communities').select('*').order('name'),
      ]);
      setDiscussions(d as Discussion[] ?? []);
      setCommunities(c as Community[] ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data } = await supabase.from('discussions').select('*').eq('parent_id', selected.id).order('created_at', { ascending: true });
      setReplies(data as Discussion[] ?? []);
    })();
  }, [selected]);

  const createDiscussion = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('discussions').insert({
      user_id: user.id,
      author_name: profile?.full_name ?? 'Anonymous',
      community_id: communityId || null,
      title,
      body,
    });
    setSubmitting(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Discussion posted!', 'success');
    setTitle(''); setBody(''); setCommunityId('');
    const { data } = await supabase.from('discussions').select('*').is('parent_id', null).order('created_at', { ascending: false });
    setDiscussions(data as Discussion[] ?? []);
  };

  const postReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selected || !replyText.trim()) return;
    const { error } = await supabase.from('discussions').insert({
      user_id: user.id,
      author_name: profile?.full_name ?? 'Anonymous',
      community_id: selected.community_id,
      title: 'Reply',
      body: replyText,
      parent_id: selected.id,
    });
    if (error) { toast(error.message, 'error'); return; }
    setReplyText('');
    const { data } = await supabase.from('discussions').select('*').eq('parent_id', selected.id).order('created_at', { ascending: true });
    setReplies(data as Discussion[] ?? []);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-blue-600" /></div>;
  }

  if (selected) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <button onClick={() => setSelected(null)} className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back to discussions</button>
        <div className="card p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selected.title}</h1>
          <p className="text-xs text-slate-500 mb-4">by {selected.author_name} · {new Date(selected.created_at).toLocaleString()}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selected.body}</p>
        </div>

        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Replies ({replies.length})</h3>
        <div className="space-y-3 mb-6">
          {replies.map((r) => (
            <div key={r.id} className="card p-4">
              <p className="text-xs text-slate-500 mb-1">{r.author_name} · {new Date(r.created_at).toLocaleString()}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{r.body}</p>
            </div>
          ))}
          {replies.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No replies yet. Be the first!</p>}
        </div>

        {user ? (
          <form onSubmit={postReply} className="card p-4 flex gap-2">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="input flex-1" />
            <button type="submit" className="btn-primary"><Send className="h-4 w-4" /></button>
          </form>
        ) : (
          <p className="text-sm text-slate-400 text-center">Sign in to reply.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Community Discussions</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Talk about power issues with your neighbors.</p>
      </div>

      {user ? (
        <form onSubmit={createDiscussion} className="card p-5 mb-6 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Discussion title" className="input" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts..." rows={3} className="input resize-none" />
          <div className="flex gap-2">
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} className="input flex-1">
              <option value="">General (no community)</option>
              {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />} Post
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-5 mb-6 text-center">
          <p className="text-sm text-slate-500">Sign in to start a discussion.</p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-3">Sign In</button>
        </div>
      )}

      {discussions.length > 0 ? (
        <div className="space-y-3">
          {discussions.map((d) => (
            <button key={d.id} onClick={() => setSelected(d)} className="card p-4 w-full text-left hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                {d.is_pinned && <Pin className="h-4 w-4 text-blue-500 mt-0.5" />}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{d.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.body}</p>
                  <p className="text-xs text-slate-400 mt-2">{d.author_name} · {new Date(d.created_at).toLocaleDateString()}</p>
                </div>
                <MessageSquare className="h-4 w-4 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={<MessageSquare />} title="No discussions yet" description="Be the first to start a conversation about power in your area." />
      )}
    </div>
  );
}
