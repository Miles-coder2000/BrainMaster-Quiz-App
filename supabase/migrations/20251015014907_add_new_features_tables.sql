/*
  # Add New Features to Brain Master Quiz App

  ## 1. New Tables
    - `daily_challenges`: Daily quiz challenges with time limits and bonus rewards
    - `daily_challenge_completions`: Tracks user completions of daily challenges
    - `power_ups`: Available power-ups in the store
    - `user_power_ups`: User's power-up inventory
    - `badges`: Collectible badges
    - `user_badges`: User's badge collection
    - `daily_rewards`: Daily login reward tracking
    - `quiz_categories`: Expanded quiz categories

  ## 2. Security
    - Enable RLS on all new tables
    - Users can view and manage their own data
    - Public read access for power_ups, badges, quiz_categories
    - Daily challenges visible to all authenticated users

  ## 3. Initial Data
    - Insert default power-ups
    - Insert default badges
    - Insert expanded quiz categories
*/

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date UNIQUE NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  bonus_xp integer DEFAULT 50,
  bonus_coins integer DEFAULT 25,
  time_limit integer DEFAULT 300,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Create daily_challenge_completions table
CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE daily_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge completions"
  ON daily_challenge_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge completions"
  ON daily_challenge_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create power_ups table
CREATE TABLE IF NOT EXISTS power_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '⚡',
  price integer DEFAULT 50,
  type text NOT NULL
);

ALTER TABLE power_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view power ups"
  ON power_ups FOR SELECT
  TO authenticated
  USING (true);

-- Create user_power_ups table
CREATE TABLE IF NOT EXISTS user_power_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  power_up_id uuid REFERENCES power_ups(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  UNIQUE(user_id, power_up_id)
);

ALTER TABLE user_power_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own power ups"
  ON user_power_ups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own power ups"
  ON user_power_ups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own power ups"
  ON user_power_ups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏅',
  requirement text NOT NULL,
  rarity text DEFAULT 'common'
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create daily_rewards table
CREATE TABLE IF NOT EXISTS daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  claim_date date NOT NULL,
  day_number integer NOT NULL,
  xp_reward integer DEFAULT 0,
  coin_reward integer DEFAULT 0,
  claimed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, claim_date)
);

ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily rewards"
  ON daily_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily rewards"
  ON daily_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create quiz_categories table
CREATE TABLE IF NOT EXISTS quiz_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '📚',
  is_active boolean DEFAULT true
);

ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz categories"
  ON quiz_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default power-ups
INSERT INTO power_ups (name, description, icon, price, type)
VALUES
  ('Hint', 'Remove 2 incorrect answers', '💡', 50, 'hint'),
  ('Skip Question', 'Skip difficult question without penalty', '⏭️', 75, 'skip'),
  ('Extra Time', 'Add 30 seconds to timer', '⏰', 60, 'time'),
  ('Freeze Timer', 'Pause timer for 15 seconds', '❄️', 80, 'freeze'),
  ('Double XP', 'Earn 2x XP for this quiz', '⭐', 100, 'double_xp')
ON CONFLICT (name) DO NOTHING;

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement, rarity)
VALUES
  ('Quick Thinker', 'Complete a quiz in under 2 minutes', '⚡', 'complete_quiz_under_2min', 'common'),
  ('Speedrunner', 'Complete 5 quizzes in one day', '🏃', 'complete_5_quizzes_one_day', 'rare'),
  ('Night Owl', 'Complete a quiz after midnight', '🦉', 'complete_quiz_after_midnight', 'common'),
  ('Early Bird', 'Complete a quiz before 6 AM', '🐦', 'complete_quiz_before_6am', 'common'),
  ('Perfectionist', 'Get 3 perfect scores in a row', '💯', 'three_perfect_scores', 'epic'),
  ('Category Master', 'Complete 10 quizzes in same category', '🎓', 'complete_10_same_category', 'rare'),
  ('Difficulty King', 'Complete 20 Hard difficulty quizzes', '👑', 'complete_20_hard', 'legendary'),
  ('Daily Champion', 'Complete 30 daily challenges', '🏆', 'complete_30_daily_challenges', 'legendary'),
  ('Comeback Kid', 'Win with only 1 life remaining', '💪', 'win_with_1_life', 'rare'),
  ('Power Player', 'Use all power-ups in single quiz', '🔋', 'use_all_powerups', 'epic')
ON CONFLICT (name) DO NOTHING;

-- Insert expanded quiz categories
INSERT INTO quiz_categories (name, description, icon, is_active)
VALUES
  ('General Knowledge', 'Test your overall knowledge', '🧠', true),
  ('Science', 'Physics, Chemistry, Biology', '🔬', true),
  ('History', 'World history and events', '📜', true),
  ('Technology', 'Computers, AI, and Innovation', '💻', true),
  ('Sports', 'Games, athletes, and records', '⚽', true),
  ('Geography', 'Countries, capitals, and landmarks', '🌍', true),
  ('Entertainment', 'Movies, music, and pop culture', '🎬', true),
  ('Literature', 'Books, authors, and poetry', '📚', true),
  ('Math', 'Numbers, equations, and logic', '🔢', true),
  ('Art', 'Paintings, artists, and movements', '🎨', true)
ON CONFLICT (name) DO NOTHING;