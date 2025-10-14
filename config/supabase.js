import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zqjnydvthfmnbedktulq.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxam55ZHZ0aGZtbmJlZGt0dWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjUwNjUsImV4cCI6MjA3NjA0MTA2NX0.Cv_-8-e6Pv_d42AFWsVkRJvWBzLCHX3YGxG2F5cLc0M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
