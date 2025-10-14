-- Brain Master Quiz Database Schema
-- 
-- 1. New Tables
--    - profiles: User profile data with XP, coins, scores
--    - quiz_results: Historical quiz completion records
--    - achievements: Available achievements with rewards
--    - user_achievements: Tracks unlocked achievements per user
--    - leaderboard: View for global rankings
-- 
-- 2. Security
--    - RLS enabled on all tables
--    - Users can manage their own data
--    - Public leaderboard access
-- 
-- 3. Important Notes
--    - Profiles auto-created on signup
--    - All timestamps use timestamptz
--    - Achievements unlock based on milestones

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  xp integer DEFAULT 0,
  coins integer DEFAULT 0,
  high_score integer DEFAULT 0,
  daily_streak integer DEFAULT 0,
  last_played timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  difficulty text NOT NULL,
  score integer DEFAULT 0,
  total integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  coins_earned integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  requirement text NOT NULL,
  xp_reward integer DEFAULT 0,
  coin_reward integer DEFAULT 0
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement, xp_reward, coin_reward)
VALUES
  ('First Steps', 'Complete your first quiz', '🎯', 'complete_1_quiz', 50, 25),
  ('Quiz Master', 'Complete 10 quizzes', '🧠', 'complete_10_quizzes', 200, 100),
  ('Perfect Score', 'Get 10/10 on any quiz', '⭐', 'perfect_score', 100, 50),
  ('Streak Keeper', 'Maintain a 7-day streak', '🔥', '7_day_streak', 300, 150),
  ('Knowledge Seeker', 'Earn 1000 XP', '📚', 'earn_1000_xp', 500, 250),
  ('Coin Collector', 'Earn 500 coins', '💰', 'earn_500_coins', 400, 200),
  ('Hard Mode Champion', 'Complete 5 Hard difficulty quizzes', '💪', 'complete_5_hard', 600, 300)
ON CONFLICT (name) DO NOTHING;