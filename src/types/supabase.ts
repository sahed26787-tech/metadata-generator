
export interface UserProfile {
  id: string;
  email: string;
  plan_type: 'free' | 'standard' | 'exclusive';
  total_credits: number;      // 15, 5000, or 15000
  credits_used: number;
  remaining_credits: number;
  credits_reset_type: 'never' | 'monthly';
  credits_reset_at?: string;
  is_premium: boolean;
  plan_started_at?: string;
  plan_expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ImageMetadataGeneration {
  id: string;
  user_id: string;
  prompt: string;
  created_at?: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  email: string;
  session_id: string;
  last_activity: string;
}
