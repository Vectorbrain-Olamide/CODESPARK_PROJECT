import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Community, OutageReport, PowerHistoryEntry, LeaderboardEntry } from '@/types';

export function useDashboardData(profileCommunity: string | null) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [powerHistory, setPowerHistory] = useState<PowerHistoryEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [{ data: comms }, { data: reps }, { data: lb }] = await Promise.all([
        supabase.from('communities').select('*').order('name'),
        supabase.from('outage_reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('leaderboard').select('*').order('rank'),
      ]);

      if (!mounted) return;

      setCommunities(comms as Community[] ?? []);
      setReports(reps as OutageReport[] ?? []);
      setLeaderboard(lb as LeaderboardEntry[] ?? []);

      // Load power history for the user's community or first community
      const targetCommunity = (comms as Community[])?.find((c) => c.name === profileCommunity) ?? (comms as Community[])?.[0];
      if (targetCommunity) {
        const { data: history } = await supabase
          .from('power_history')
          .select('*')
          .eq('community_id', targetCommunity.id)
          .order('recorded_date', { ascending: true })
          .order('hour', { ascending: true });
        if (mounted) setPowerHistory(history as PowerHistoryEntry[] ?? []);
      }
      setLoading(false);
    }

    load();

    // Realtime subscription for new reports
    const sub = supabase
      .channel('outage_reports_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'outage_reports' }, (payload) => {
        setReports((prev) => [payload.new as OutageReport, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(sub);
    };
  }, [profileCommunity]);

  return { communities, reports, powerHistory, leaderboard, loading };
}
