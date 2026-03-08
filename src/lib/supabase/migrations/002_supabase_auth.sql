-- ============================================================
-- Ophyra Diagnosis — Migration 002: Supabase Auth (reemplaza Clerk)
-- ============================================================

-- 1. Modificar tabla users: quitar clerk_id, vincular con auth.users
ALTER TABLE users DROP COLUMN IF EXISTS clerk_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Añadir photo_urls a diagnoses (faltaba en 001)
ALTER TABLE diagnoses ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]'::jsonb;

-- 3. Recrear RLS policies para Supabase Auth
DROP POLICY IF EXISTS "Users read own diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Anyone can insert diagnoses" ON diagnoses;

-- Users: solo el propio usuario lee/edita su perfil
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (auth_id = auth.uid());

-- Diagnoses: insertar anonimamente, leer propios
CREATE POLICY "Anyone can insert diagnoses" ON diagnoses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own diagnoses" ON diagnoses
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Service role full access diagnoses" ON diagnoses
  FOR ALL USING (auth.role() = 'service_role');

-- Payments: solo lectura propia + service role escribe
CREATE POLICY "Users read own payments" ON payments
  FOR SELECT USING (
    diagnosis_id IN (
      SELECT d.id FROM diagnoses d
      JOIN users u ON d.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Service role full access payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Funcion para crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: al crear usuario en auth.users → crear perfil en public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Funcion para vincular diagnosticos anonimos al registrarse
CREATE OR REPLACE FUNCTION public.link_anonymous_diagnoses()
RETURNS trigger AS $$
BEGIN
  UPDATE public.diagnoses
  SET user_id = (SELECT id FROM public.users WHERE auth_id = NEW.id)
  WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_link_diagnoses ON auth.users;
CREATE TRIGGER on_auth_user_link_diagnoses
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_anonymous_diagnoses();

-- 6. Storage bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('diagnosis-photos', 'diagnosis-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'diagnosis-photos');

CREATE POLICY "Anyone can read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'diagnosis-photos');
