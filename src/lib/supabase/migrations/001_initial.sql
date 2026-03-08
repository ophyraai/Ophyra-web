-- Usuarios (sync desde Clerk via webhook)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  locale TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diagnosticos
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  locale TEXT DEFAULT 'es',
  answers JSONB NOT NULL,
  scores JSONB,
  overall_score INTEGER,
  ai_analysis TEXT,
  ai_summary TEXT,
  is_paid BOOLEAN DEFAULT false,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own diagnoses" ON diagnoses
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid())
    OR email = current_setting('app.current_email', true)
  );

CREATE POLICY "Anyone can insert diagnoses" ON diagnoses
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_diagnoses_email ON diagnoses(email);
CREATE INDEX idx_diagnoses_user_id ON diagnoses(user_id);
