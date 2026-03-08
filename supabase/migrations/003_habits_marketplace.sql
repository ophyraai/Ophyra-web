-- ============================================
-- Migration 003: Habits, Subscriptions & Marketplace
-- ============================================

-- Daily tips for landing page
CREATE TABLE IF NOT EXISTS daily_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_es text NOT NULL,
  content_en text NOT NULL,
  tip_date date UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Premium subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  plan text NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  stripe_customer_id text,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  follow_up_date timestamptz, -- 30 days after purchase for re-diagnosis
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habits derived from AI 30-day plan
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis_id uuid REFERENCES diagnoses(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL, -- sleep|exercise|nutrition|stress|productivity|hydration
  target_frequency int NOT NULL DEFAULT 7, -- times per week
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily habit entries (check-ins)
CREATE TABLE IF NOT EXISTS habit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, entry_date)
);

-- Marketplace products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  price decimal(10,2),
  affiliate_url text,
  category text NOT NULL, -- sleep|exercise|nutrition|stress|productivity|hydration
  is_active boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

-- daily_tips: public read
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tips" ON daily_tips FOR SELECT USING (true);

-- user_subscriptions: users see only their own
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- habits: users see only their own
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- habit_entries: users see entries for their habits
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own habit entries" ON habit_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own habit entries" ON habit_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid())
  );
CREATE POLICY "Users can update own habit entries" ON habit_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_entries.habit_id AND habits.user_id = auth.uid())
  );

-- products: public read for active products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_email ON user_subscriptions(email);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_diagnosis_id ON habits(diagnosis_id);
CREATE INDEX idx_habit_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX idx_habit_entries_date ON habit_entries(entry_date);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_daily_tips_date ON daily_tips(tip_date);

-- ============================================
-- Seed daily tips
-- ============================================
INSERT INTO daily_tips (content_es, content_en, tip_date, category) VALUES
('Beber un vaso de agua al despertar activa tu metabolismo y mejora tu concentración matutina.', 'Drinking a glass of water upon waking activates your metabolism and improves morning focus.', CURRENT_DATE, 'hydration'),
('Exponerte a luz natural en los primeros 30 minutos del día regula tu reloj circadiano.', 'Getting natural light exposure in the first 30 minutes regulates your circadian clock.', CURRENT_DATE + 1, 'sleep'),
('Una caminata de 10 minutos después de comer mejora la digestión y los niveles de azúcar.', 'A 10-minute walk after eating improves digestion and blood sugar levels.', CURRENT_DATE + 2, 'exercise'),
('Hacer 3 respiraciones profundas antes de responder un email reduce el estrés crónico.', 'Taking 3 deep breaths before replying to an email reduces chronic stress.', CURRENT_DATE + 3, 'stress'),
('Planificar las 3 tareas más importantes la noche anterior aumenta tu productividad un 25%.', 'Planning your 3 most important tasks the night before boosts productivity by 25%.', CURRENT_DATE + 4, 'productivity'),
('Comer frutas y verduras de 5 colores diferentes al día asegura diversidad de nutrientes.', 'Eating fruits and vegetables of 5 different colors daily ensures nutrient diversity.', CURRENT_DATE + 5, 'nutrition'),
('Dejar el móvil fuera del dormitorio mejora la calidad de sueño en un 30%.', 'Keeping your phone out of the bedroom improves sleep quality by 30%.', CURRENT_DATE + 6, 'sleep');
