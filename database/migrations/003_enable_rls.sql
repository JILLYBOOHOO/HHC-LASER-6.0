-- ============================================================================
-- Phase 4: Row Level Security (RLS)
-- ============================================================================
-- Goal: lock down direct PostgREST / anon access.
-- Express keeps working because DATABASE_URL uses the postgres role (bypasses RLS).
-- Service-role Supabase client also bypasses RLS.
-- ============================================================================

-- Helper: enable RLS on a table (idempotent-ish)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'appointment_guests',
    'appointment_services',
    'appointment_status_log',
    'appointments',
    'audit_log',
    'before_after_photos',
    'blocked_dates',
    'booking_drafts',
    'business_hours',
    'business_settings',
    'cms_content',
    'consent_forms',
    'customer_memberships',
    'customer_packages',
    'employee_schedules',
    'employee_services',
    'employees',
    'error_logs',
    'gallery_images',
    'homepage_sections',
    'intake_forms',
    'laser_settings',
    'location_holidays',
    'locations',
    'media',
    'membership_plans',
    'notifications_log',
    'packages',
    'product_categories',
    'products',
    'promotions',
    'resources',
    'roles',
    'service_categories',
    'services',
    'testimonials',
    'transactions',
    'treatment_notes',
    'user_roles',
    'users'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ─── Drop old policies if re-running ──────────────────────────────────────────
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname LIKE 'hhc_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ─── Public catalog (anon + authenticated can READ only) ─────────────────────

CREATE POLICY hhc_public_read_locations
  ON public.locations FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_business_hours
  ON public.business_hours FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY hhc_public_read_location_holidays
  ON public.location_holidays FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY hhc_public_read_service_categories
  ON public.service_categories FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_services
  ON public.services FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_resources
  ON public.resources FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_gallery
  ON public.gallery_images FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_testimonials
  ON public.testimonials FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_promotions
  ON public.promotions FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_product_categories
  ON public.product_categories FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_products
  ON public.products FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_homepage
  ON public.homepage_sections FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_membership_plans
  ON public.membership_plans FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_packages
  ON public.packages FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY hhc_public_read_blocked_dates
  ON public.blocked_dates FOR SELECT TO anon, authenticated
  USING (TRUE);

-- ─── Authenticated: own profile ───────────────────────────────────────────────

CREATE POLICY hhc_users_select_own
  ON public.users FOR SELECT TO authenticated
  USING (auth_uid = auth.uid());

CREATE POLICY hhc_users_update_own
  ON public.users FOR UPDATE TO authenticated
  USING (auth_uid = auth.uid())
  WITH CHECK (auth_uid = auth.uid());

CREATE POLICY hhc_user_roles_select_own
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

-- ─── Authenticated: own bookings / drafts / payments / medical ────────────────

CREATE POLICY hhc_appointments_select_own
  ON public.appointments FOR SELECT TO authenticated
  USING (
    customer_user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY hhc_appointment_services_select_own
  ON public.appointment_services FOR SELECT TO authenticated
  USING (
    appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.users u ON u.id = a.customer_user_id
      WHERE u.auth_uid = auth.uid()
    )
  );

CREATE POLICY hhc_appointment_guests_select_own
  ON public.appointment_guests FOR SELECT TO authenticated
  USING (
    appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.users u ON u.id = a.customer_user_id
      WHERE u.auth_uid = auth.uid()
    )
  );

CREATE POLICY hhc_appointment_status_log_select_own
  ON public.appointment_status_log FOR SELECT TO authenticated
  USING (
    appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.users u ON u.id = a.customer_user_id
      WHERE u.auth_uid = auth.uid()
    )
  );

CREATE POLICY hhc_booking_drafts_all_own
  ON public.booking_drafts FOR ALL TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY hhc_transactions_select_own
  ON public.transactions FOR SELECT TO authenticated
  USING (
    customer_user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY hhc_intake_forms_select_own
  ON public.intake_forms FOR SELECT TO authenticated
  USING (
    customer_user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY hhc_consent_forms_select_own
  ON public.consent_forms FOR SELECT TO authenticated
  USING (
    customer_user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY hhc_customer_memberships_select_own
  ON public.customer_memberships FOR SELECT TO authenticated
  USING (
    customer_user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

CREATE POLICY hhc_customer_packages_select_own
  ON public.customer_packages FOR SELECT TO authenticated
  USING (
    customer_user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid())
  );

-- Public before/after photos only (marketing)
CREATE POLICY hhc_before_after_public_read
  ON public.before_after_photos FOR SELECT TO anon, authenticated
  USING (is_public = TRUE);

-- Media library: public URLs are on Storage; DB rows stay admin-only (no anon policy)

-- Sensitive tables intentionally have NO policies for anon/authenticated:
-- audit_log, error_logs, notifications_log, treatment_notes, laser_settings,
-- employees*, business_settings, cms_content, roles
-- → denied by default when RLS is enabled.
