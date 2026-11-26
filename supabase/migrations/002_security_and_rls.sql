-- ==============================================================================
-- 002_security_and_rls.sql - Row Level Security & Authorization
-- ==============================================================================

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins have full profile access" ON public.profiles;
CREATE POLICY "Admins have full profile access" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Prevent privilege escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Cannot alter user role.';
  END IF;
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Tamu KOSAANN'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '08123456789'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'tenant'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PROPERTIES POLICIES
CREATE POLICY "Public can view properties" ON public.properties
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage properties" ON public.properties
  FOR ALL TO authenticated USING (public.is_admin());

-- 3. ROOMS POLICIES
CREATE POLICY "Public can view active rooms" ON public.rooms
  FOR SELECT TO public USING (status <> 'inactive' OR public.is_admin());

CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL TO authenticated USING (public.is_admin());

-- 4. AMENITIES POLICIES
CREATE POLICY "Public can view amenities" ON public.amenities
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage amenities" ON public.amenities
  FOR ALL TO authenticated USING (public.is_admin());

-- 5. ROOM_AMENITIES & ROOM_IMAGES
CREATE POLICY "Public can view room amenities" ON public.room_amenities
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage room amenities" ON public.room_amenities
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public can view room images" ON public.room_images
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage room images" ON public.room_images
  FOR ALL TO authenticated USING (public.is_admin());

-- 6. BOOKINGS POLICIES
CREATE POLICY "Users view own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage all bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.is_admin());

-- 7. PAYMENTS POLICIES
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage all payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_admin());

-- 8. TENANT RECORDS POLICIES
CREATE POLICY "Users view own tenant records" ON public.tenant_records
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage tenant records" ON public.tenant_records
  FOR ALL TO authenticated
  USING (public.is_admin());

-- 9. REVIEWS POLICIES
CREATE POLICY "Public view published reviews" ON public.reviews
  FOR SELECT TO public
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Users create reviews for completed bookings" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND user_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.is_admin());

-- 10. NOTIFICATIONS POLICIES
CREATE POLICY "Users view and update own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users mark notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 11. AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 12. APP SETTINGS POLICIES
CREATE POLICY "Public can read app settings" ON public.app_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage app settings" ON public.app_settings
  FOR ALL TO authenticated USING (public.is_admin());
