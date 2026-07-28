export type PowerStatus = 'stable' | 'unstable' | 'outage';

export type ReportType =
  | 'outage'
  | 'low_voltage'
  | 'transformer_fault'
  | 'fallen_pole'
  | 'sparks'
  | 'restored';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface State {
  id: string;
  name: string;
  region: string;
}

export interface Lga {
  id: string;
  state_id: string;
  name: string;
}

export interface Community {
  id: string;
  lga_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  status: PowerStatus;
  reliability_score: number;
  avg_electricity_hours: number;
  reports_today: number;
  last_updated: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  state: string | null;
  lga: string | null;
  community: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutageReport {
  id: string;
  user_id: string | null;
  community_id: string | null;
  state: string;
  lga: string;
  community: string;
  report_type: ReportType;
  description: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  report_date: string;
  report_time: string;
  status: ReportStatus;
  upvotes: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  community: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Prediction {
  id: string;
  community_id: string | null;
  community: string;
  prediction_date: string;
  outage_probability: number;
  expected_restoration_hours: number;
  best_hours: string | null;
  reliability_score: number;
}

export interface LeaderboardEntry {
  id: string;
  community_id: string | null;
  community: string;
  state: string | null;
  lga: string | null;
  reliability_score: number;
  avg_restoration_hours: number;
  total_outages: number;
  rank: number;
  period: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  tier: 'gold' | 'silver' | 'bronze' | null;
  community_id: string | null;
}

export interface PowerHistoryEntry {
  id: string;
  community_id: string;
  recorded_date: string;
  hour: number;
  has_power: boolean;
}

export interface Discussion {
  id: string;
  user_id: string | null;
  community_id: string | null;
  author_name: string | null;
  title: string;
  body: string;
  parent_id: string | null;
  is_pinned: boolean;
  created_at: string;
}

export interface GeneratorCalculation {
  id: string;
  user_id: string;
  generator_size: number | null;
  fuel_consumption: number | null;
  fuel_price: number | null;
  hours_per_day: number | null;
  daily_cost: number | null;
  weekly_cost: number | null;
  monthly_cost: number | null;
  yearly_cost: number | null;
  created_at: string;
}

export interface InverterCalculation {
  id: string;
  user_id: string;
  appliances: Record<string, number> | null;
  inverter_size: number | null;
  battery_capacity: number | null;
  backup_hours: number | null;
  solar_panel_size: number | null;
  monthly_usage: number | null;
  created_at: string;
}

export interface AiChat {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
