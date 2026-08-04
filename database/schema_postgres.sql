-- ============================================================================
--  HHC LASER MedSpa — PostgreSQL Production Schema (Supabase)
-- ============================================================================

-- Create ENUM types
CREATE TYPE auth_method_enum AS ENUM ('Email Password', 'Google OAuth');
CREATE TYPE role_enum AS ENUM ('developer','owner','admin','manager','specialist','staff','customer');
CREATE TYPE resource_type_enum AS ENUM ('room','laser_machine','equipment');
CREATE TYPE booking_type_enum AS ENUM ('self','other','group');
CREATE TYPE booking_source_enum AS ENUM ('website', 'phone', 'walk_in', 'whatsapp', 'social_media', 'admin', 'staff');
CREATE TYPE appointment_status_enum AS ENUM ('pending','confirmed','checked_in','in_treatment','completed','cancelled','no_show');
CREATE TYPE payment_status_enum AS ENUM ('pending_payment', 'paid_online', 'paid_in_store', 'paid_by_phone', 'deposit_paid', 'pay_at_appointment', 'refunded', 'complimentary');
CREATE TYPE transaction_status_enum AS ENUM ('pending','completed','failed','refunded','partial');
CREATE TYPE plan_type_enum AS ENUM ('monthly','annual');
CREATE TYPE membership_status_enum AS ENUM ('active','paused','cancelled','expired');
CREATE TYPE fitzpatrick_type_enum AS ENUM ('I','II','III','IV','V','VI');
CREATE TYPE notification_type_enum AS ENUM ('email','sms','push');
CREATE TYPE notification_status_enum AS ENUM ('sent','failed','pending');
CREATE TYPE media_type_enum AS ENUM ('image','video','document');
CREATE TYPE error_status_enum AS ENUM ('open','resolved','ignored');

-- Function to handle updated_at automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ─── USERS & AUTHENTICATION ────────────────────────────────────────────────────

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) DEFAULT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  DEFAULT NULL,
  date_of_birth   DATE         DEFAULT NULL,
  profile_photo_url VARCHAR(512) DEFAULT NULL,
  google_id       VARCHAR(255) DEFAULT NULL UNIQUE,
  auth_uid        UUID UNIQUE DEFAULT NULL, -- Supabase auth.users.id
  token_version   INTEGER NOT NULL DEFAULT 0,
  authentication_method auth_method_enum NOT NULL DEFAULT 'Email Password',
  last_login      TIMESTAMP     DEFAULT NULL,
  is_active       BOOLEAN   NOT NULL DEFAULT TRUE,
  email_verified  BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email ON users (email);
CREATE INDEX idx_google_id ON users (google_id);
CREATE INDEX idx_users_auth_uid ON users (auth_uid);

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE roles (
  id    SERIAL PRIMARY KEY,
  name  role_enum NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('developer'),('owner'),('admin'),('manager'),('specialist'),('staff'),('customer') ON CONFLICT DO NOTHING;

CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role    role_enum NOT NULL,
  PRIMARY KEY (user_id, role),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── LOCATIONS ────────────────────────────────────────────────────────────────

CREATE TABLE locations (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  address         VARCHAR(500) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  parish          VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  email           VARCHAR(255) NOT NULL,
  google_maps_url VARCHAR(512) DEFAULT NULL,
  whatsapp_number VARCHAR(20)  DEFAULT NULL,
  is_active       BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_hours (
  id          SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  day_of_week SMALLINT NOT NULL, -- 0=Sunday,6=Saturday
  open_time   TIME NOT NULL,
  close_time  TIME NOT NULL,
  is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (location_id, day_of_week),
  CONSTRAINT fk_bh_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE location_holidays (
  id          SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  holiday_date DATE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  CONSTRAINT fk_lh_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- ─── SERVICE CATALOG ──────────────────────────────────────────────────────────

CREATE TABLE service_categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url    VARCHAR(512) DEFAULT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN   NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_category_slug ON service_categories (slug);

CREATE TABLE services (
  id                    SERIAL PRIMARY KEY,
  category_id           INTEGER NOT NULL,
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) NOT NULL UNIQUE,
  description           TEXT,
  short_description     VARCHAR(500),
  duration_minutes      SMALLINT NOT NULL DEFAULT 60,
  price_jmd             DECIMAL(10,2) NOT NULL,
  price_usd             DECIMAL(10,2) DEFAULT NULL,
  deposit_required      BOOLEAN   NOT NULL DEFAULT FALSE,
  deposit_amount_jmd    DECIMAL(10,2) DEFAULT NULL,
  requires_consultation BOOLEAN   NOT NULL DEFAULT FALSE,
  preparation_notes     TEXT DEFAULT NULL,
  aftercare_notes       TEXT DEFAULT NULL,
  thumbnail_url         VARCHAR(512) DEFAULT NULL,
  prep_video_url        VARCHAR(512) DEFAULT NULL,
  gallery_images        JSONB DEFAULT NULL,
  is_featured           BOOLEAN   NOT NULL DEFAULT FALSE,
  is_active             BOOLEAN   NOT NULL DEFAULT TRUE,
  sort_order            SMALLINT NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_svc_category FOREIGN KEY (category_id) REFERENCES service_categories(id)
);
CREATE INDEX idx_service_slug ON services (slug);
CREATE INDEX idx_service_category ON services (category_id);

-- ─── EMPLOYEES ────────────────────────────────────────────────────────────────

CREATE TABLE employees (
  id                   SERIAL PRIMARY KEY,
  user_id              INTEGER NOT NULL UNIQUE,
  location_id          INTEGER NOT NULL,
  title                VARCHAR(100) DEFAULT NULL,
  bio                  TEXT DEFAULT NULL,
  specializations      TEXT DEFAULT NULL,
  certifications       TEXT DEFAULT NULL,
  is_accepting_clients BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_emp_location FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE employee_services (
  employee_id INTEGER NOT NULL,
  service_id  INTEGER NOT NULL,
  PRIMARY KEY (employee_id, service_id),
  CONSTRAINT fk_es_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_es_svc FOREIGN KEY (service_id)  REFERENCES services(id)  ON DELETE CASCADE
);

CREATE TABLE employee_schedules (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  day_of_week SMALLINT NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (employee_id, location_id, day_of_week),
  CONSTRAINT fk_esc_emp      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_esc_location FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- ─── RESOURCES ────────────────────────────────────────────────────────────────

CREATE TABLE resources (
  id          SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  name        VARCHAR(255) NOT NULL,
  type        resource_type_enum NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  is_active   BOOLEAN   NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_res_location FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE appointments (
  id                 SERIAL PRIMARY KEY,
  booking_type       booking_type_enum NOT NULL DEFAULT 'self',
  group_id           VARCHAR(36) DEFAULT NULL,
  customer_user_id   INTEGER NOT NULL,
  booked_for_user_id INTEGER DEFAULT NULL,
  employee_id        INTEGER NOT NULL,
  location_id        INTEGER NOT NULL,
  resource_id        INTEGER DEFAULT NULL,
  scheduled_date     DATE NOT NULL,
  start_time         TIME NOT NULL,
  end_time           TIME NOT NULL,
  booking_source     booking_source_enum NOT NULL DEFAULT 'website',
  status             appointment_status_enum NOT NULL DEFAULT 'pending',
  payment_status     payment_status_enum NOT NULL DEFAULT 'pending_payment',
  confirmation_code  VARCHAR(50) UNIQUE DEFAULT NULL,
  notes              TEXT DEFAULT NULL,
  total_amount_jmd   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  deposit_paid_jmd   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_customer  FOREIGN KEY (customer_user_id)   REFERENCES users(id),
  CONSTRAINT fk_appt_employee  FOREIGN KEY (employee_id)        REFERENCES employees(id),
  CONSTRAINT fk_appt_location  FOREIGN KEY (location_id)        REFERENCES locations(id),
  CONSTRAINT fk_appt_resource  FOREIGN KEY (resource_id)        REFERENCES resources(id) ON DELETE SET NULL
);
CREATE INDEX idx_appt_date       ON appointments (scheduled_date);
CREATE INDEX idx_appt_customer   ON appointments (customer_user_id);
CREATE INDEX idx_appt_employee   ON appointments (employee_id);
CREATE INDEX idx_appt_status     ON appointments (status);
CREATE INDEX idx_appt_group      ON appointments (group_id);

CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE appointment_services (
  id             SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  service_id     INTEGER NOT NULL,
  price_jmd      DECIMAL(10,2) NOT NULL,
  duration_minutes SMALLINT NOT NULL,
  CONSTRAINT fk_aps_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_aps_svc  FOREIGN KEY (service_id)     REFERENCES services(id)
);

CREATE TABLE appointment_guests (
  id             SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  group_id       VARCHAR(36) NOT NULL,
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(255) DEFAULT NULL,
  phone          VARCHAR(20)  DEFAULT NULL,
  CONSTRAINT fk_ag_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE TABLE appointment_status_log (
  id                  SERIAL PRIMARY KEY,
  appointment_id      INTEGER NOT NULL,
  old_status          appointment_status_enum DEFAULT NULL,
  new_status          appointment_status_enum NOT NULL,
  changed_by_user_id  INTEGER DEFAULT NULL,
  changed_by_system   BOOLEAN NOT NULL DEFAULT FALSE,
  notes               VARCHAR(500) DEFAULT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asl_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);
CREATE INDEX idx_asl_appt ON appointment_status_log (appointment_id);

-- ─── TRANSACTIONS / PAYMENTS ──────────────────────────────────────────────────

CREATE TABLE transactions (
  id                   SERIAL PRIMARY KEY,
  appointment_id       INTEGER DEFAULT NULL,
  customer_user_id     INTEGER NOT NULL,
  recorded_by_user_id  INTEGER DEFAULT NULL,
  fiserv_txn_id        VARCHAR(255) DEFAULT NULL,
  idempotency_key      VARCHAR(64)  NOT NULL UNIQUE,
  amount_jmd           DECIMAL(10,2) NOT NULL,
  currency             VARCHAR(3)   NOT NULL DEFAULT 'JMD',
  status               transaction_status_enum NOT NULL DEFAULT 'pending',
  payment_method       VARCHAR(50)  DEFAULT NULL,
  fiserv_approval_code VARCHAR(50)  DEFAULT NULL,
  fiserv_response_code VARCHAR(10)  DEFAULT NULL,
  fiserv_response_message VARCHAR(255) DEFAULT NULL,
  notes                VARCHAR(500) DEFAULT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_txn_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_txn_recorded FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
);
CREATE INDEX idx_txn_customer ON transactions (customer_user_id);
CREATE INDEX idx_txn_appt     ON transactions (appointment_id);
CREATE INDEX idx_txn_status   ON transactions (status);

CREATE TRIGGER update_transactions_modtime BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ─── MEMBERSHIPS ──────────────────────────────────────────────────────────────

CREATE TABLE membership_plans (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  plan_type           plan_type_enum NOT NULL,
  price_jmd           DECIMAL(10,2) NOT NULL,
  sessions_per_cycle  SMALLINT NOT NULL DEFAULT 4,
  services_included   TEXT NOT NULL,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_memberships (
  id                  SERIAL PRIMARY KEY,
  customer_user_id    INTEGER NOT NULL,
  plan_id             INTEGER NOT NULL,
  status              membership_status_enum NOT NULL DEFAULT 'active',
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  sessions_remaining  SMALLINT NOT NULL DEFAULT 0,
  auto_renew          BOOLEAN NOT NULL DEFAULT TRUE,
  last_transaction_id INTEGER DEFAULT NULL,
  created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cm_customer FOREIGN KEY (customer_user_id)    REFERENCES users(id),
  CONSTRAINT fk_cm_plan     FOREIGN KEY (plan_id)             REFERENCES membership_plans(id),
  CONSTRAINT fk_cm_txn      FOREIGN KEY (last_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
CREATE INDEX idx_cm_customer ON customer_memberships (customer_user_id);

CREATE TRIGGER update_customer_memberships_modtime BEFORE UPDATE ON customer_memberships FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ─── PACKAGES ─────────────────────────────────────────────────────────────────

CREATE TABLE packages (
  id           SERIAL PRIMARY KEY,
  service_id   INTEGER NOT NULL,
  name         VARCHAR(255) NOT NULL,
  sessions     SMALLINT NOT NULL,
  price_jmd    DECIMAL(10,2) NOT NULL,
  validity_days SMALLINT NOT NULL DEFAULT 365,
  is_active    BOOLEAN   NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_pkg_svc FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE customer_packages (
  id                   SERIAL PRIMARY KEY,
  customer_user_id     INTEGER NOT NULL,
  package_id           INTEGER NOT NULL,
  sessions_remaining   SMALLINT NOT NULL,
  purchase_date        DATE NOT NULL,
  expiry_date          DATE NOT NULL,
  purchase_transaction_id INTEGER DEFAULT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cp_customer FOREIGN KEY (customer_user_id)         REFERENCES users(id),
  CONSTRAINT fk_cp_package  FOREIGN KEY (package_id)               REFERENCES packages(id),
  CONSTRAINT fk_cp_txn      FOREIGN KEY (purchase_transaction_id)  REFERENCES transactions(id) ON DELETE SET NULL
);

-- ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────

CREATE TABLE intake_forms (
  id                   SERIAL PRIMARY KEY,
  customer_user_id     INTEGER NOT NULL,
  appointment_id       INTEGER DEFAULT NULL,
  fitzpatrick_type     fitzpatrick_type_enum DEFAULT NULL,
  skin_conditions      TEXT DEFAULT NULL,
  allergies            TEXT DEFAULT NULL,
  medications          TEXT DEFAULT NULL,
  contraindications    TEXT DEFAULT NULL,
  previous_treatments  TEXT DEFAULT NULL,
  pregnancy_status     BOOLEAN NOT NULL DEFAULT FALSE,
  pacemaker_status     BOOLEAN NOT NULL DEFAULT FALSE,
  keloid_history       BOOLEAN NOT NULL DEFAULT FALSE,
  sun_exposure_recent  BOOLEAN NOT NULL DEFAULT FALSE,
  additional_notes     TEXT DEFAULT NULL,
  submitted_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_if_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_if_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id) ON DELETE SET NULL
);
CREATE INDEX idx_if_customer ON intake_forms (customer_user_id);

CREATE TABLE treatment_notes (
  id               SERIAL PRIMARY KEY,
  appointment_id   INTEGER NOT NULL,
  employee_id      INTEGER NOT NULL,
  customer_user_id INTEGER NOT NULL,
  service_id       INTEGER NOT NULL,
  notes            TEXT NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tn_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id),
  CONSTRAINT fk_tn_emp      FOREIGN KEY (employee_id)      REFERENCES employees(id),
  CONSTRAINT fk_tn_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_tn_service  FOREIGN KEY (service_id)       REFERENCES services(id)
);
CREATE INDEX idx_tn_customer ON treatment_notes (customer_user_id);
CREATE INDEX idx_tn_appt     ON treatment_notes (appointment_id);

CREATE TRIGGER update_treatment_notes_modtime BEFORE UPDATE ON treatment_notes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE laser_settings (
  id                SERIAL PRIMARY KEY,
  treatment_note_id INTEGER NOT NULL,
  body_area         VARCHAR(100) NOT NULL,
  fluence           DECIMAL(6,2) NOT NULL,
  pulse_width       DECIMAL(6,2) NOT NULL,
  frequency_hz      DECIMAL(6,2) NOT NULL,
  spot_size_mm      DECIMAL(5,2) NOT NULL,
  passes            SMALLINT NOT NULL DEFAULT 1,
  skin_reaction     VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_ls_note FOREIGN KEY (treatment_note_id) REFERENCES treatment_notes(id) ON DELETE CASCADE
);

CREATE TABLE before_after_photos (
  id             SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  employee_id    INTEGER NOT NULL,
  body_area      VARCHAR(100) NOT NULL,
  before_url     VARCHAR(512) DEFAULT NULL,
  after_url      VARCHAR(512) DEFAULT NULL,
  notes          TEXT DEFAULT NULL,
  is_public      BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bap_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  CONSTRAINT fk_bap_emp  FOREIGN KEY (employee_id)    REFERENCES employees(id)
);
CREATE INDEX idx_bap_appt ON before_after_photos (appointment_id);

CREATE TABLE consent_forms (
  id               SERIAL PRIMARY KEY,
  customer_user_id INTEGER NOT NULL,
  appointment_id   INTEGER NOT NULL,
  service_id       INTEGER NOT NULL,
  form_version     VARCHAR(10)  NOT NULL DEFAULT '1.0',
  pdf_url          VARCHAR(512) DEFAULT NULL,
  ip_address       VARCHAR(45)  DEFAULT NULL,
  signed_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cf_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_cf_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id),
  CONSTRAINT fk_cf_service  FOREIGN KEY (service_id)       REFERENCES services(id)
);
CREATE INDEX idx_cf_customer ON consent_forms (customer_user_id);

-- ─── CMS ──────────────────────────────────────────────────────────────────────

CREATE TABLE cms_content (
  id         SERIAL PRIMARY KEY,
  key_name   VARCHAR(100) NOT NULL UNIQUE, -- Renamed from `key` (reserved word)
  type       VARCHAR(50) NOT NULL DEFAULT 'text', -- Replaced ENUM
  value      TEXT NOT NULL,
  label      VARCHAR(255) NOT NULL,
  updated_by INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cms_user FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TRIGGER update_cms_content_modtime BEFORE UPDATE ON cms_content FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE gallery_images (
  id          SERIAL PRIMARY KEY,
  image_url   VARCHAR(512) NOT NULL,
  alt_text    VARCHAR(255) NOT NULL,
  category    VARCHAR(100) DEFAULT NULL,
  is_featured BOOLEAN   NOT NULL DEFAULT FALSE,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE testimonials (
  id           SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  rating       SMALLINT NOT NULL DEFAULT 5,
  content      TEXT NOT NULL,
  service_name VARCHAR(255) DEFAULT NULL,
  photo_url    VARCHAR(512) DEFAULT NULL,
  is_featured  BOOLEAN   NOT NULL DEFAULT FALSE,
  is_active    BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotions (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  discount_pct SMALLINT DEFAULT NULL,
  discount_jmd DECIMAL(10,2) DEFAULT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  image_url    VARCHAR(512) DEFAULT NULL,
  service_ids  TEXT DEFAULT NULL,
  promo_code   VARCHAR(50)  DEFAULT NULL UNIQUE,
  is_active    BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_promo_dates ON promotions (start_date, end_date);

-- ─── NOTIFICATIONS & AUDIT ────────────────────────────────────────────────────

CREATE TABLE notifications_log (
  id         SERIAL PRIMARY KEY,
  type       notification_type_enum NOT NULL,
  recipient  VARCHAR(255) NOT NULL,
  subject    VARCHAR(500) NOT NULL,
  status     notification_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_nl_type   ON notifications_log (type);
CREATE INDEX idx_nl_status ON notifications_log (status);

CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER DEFAULT NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50)  DEFAULT NULL,
  entity_id   INTEGER DEFAULT NULL,
  old_values  JSONB DEFAULT NULL,
  new_values  JSONB DEFAULT NULL,
  ip_address  VARCHAR(45)  DEFAULT NULL,
  user_agent  VARCHAR(500) DEFAULT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_al_user   ON audit_log (user_id);
CREATE INDEX idx_al_action ON audit_log (action);
CREATE INDEX idx_al_entity ON audit_log (entity_type, entity_id);

-- ─── CMS & DEVELOPER DASHBOARD ────────────────────────────────────────────────

CREATE TABLE business_settings (
  setting_key   VARCHAR(100) PRIMARY KEY,
  setting_value JSONB NOT NULL,
  description   VARCHAR(255) DEFAULT NULL,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_business_settings_modtime BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE media (
  id            SERIAL PRIMARY KEY,
  file_name     VARCHAR(255) NOT NULL,
  file_url      VARCHAR(512) NOT NULL,
  file_type     media_type_enum NOT NULL DEFAULT 'image',
  mime_type     VARCHAR(100) NOT NULL,
  size_bytes    INTEGER NOT NULL,
  uploaded_by   INTEGER DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE homepage_sections (
  id            SERIAL PRIMARY KEY,
  section_type  VARCHAR(50) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  config_json   JSONB DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_homepage_sections_modtime BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE error_logs (
  id            SERIAL PRIMARY KEY,
  error_type    VARCHAR(100) NOT NULL,
  message       TEXT NOT NULL,
  stack_trace   TEXT DEFAULT NULL,
  user_id       INTEGER DEFAULT NULL,
  endpoint      VARCHAR(255) DEFAULT NULL,
  method        VARCHAR(10) DEFAULT NULL,
  status        error_status_enum NOT NULL DEFAULT 'open',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at   TIMESTAMP DEFAULT NULL,
  CONSTRAINT fk_err_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- FEATURED PRODUCTS SECTION
-- -----------------------------------------------------------------------------

CREATE TABLE product_categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prodcat_slug ON product_categories (slug);

CREATE TABLE products (
  id               SERIAL PRIMARY KEY,
  category_id      INTEGER NOT NULL,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  price_jmd        DECIMAL(10,2) NOT NULL,
  stock_quantity   INTEGER NOT NULL DEFAULT 0,
  image_url        VARCHAR(512) DEFAULT NULL,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES product_categories(id)
);
CREATE INDEX idx_prod_slug ON products (slug);
CREATE INDEX idx_prod_cat ON products (category_id);

CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

-- Default location
INSERT INTO locations (id, name, address, city, parish, phone, email, whatsapp_number) VALUES
(1, 'HHC LASER Kingston', '123 Constant Spring Road', 'Kingston', 'Kingston', '+1-876-555-0100', 'kingston@hhclaser.com', '+18765550100') ON CONFLICT DO NOTHING;

-- Reset sequence for locations if id was manually inserted
SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations));

-- Business hours (Mon-Sat, 9am-6pm)
INSERT INTO business_hours (location_id, day_of_week, open_time, close_time, is_closed)
VALUES
(1, 0, '09:00:00', '18:00:00', TRUE),  -- Sunday closed
(1, 1, '09:00:00', '18:00:00', FALSE),
(1, 2, '09:00:00', '18:00:00', FALSE),
(1, 3, '09:00:00', '18:00:00', FALSE),
(1, 4, '09:00:00', '18:00:00', FALSE),
(1, 5, '09:00:00', '18:00:00', FALSE),
(1, 6, '10:00:00', '16:00:00', FALSE) ON CONFLICT DO NOTHING;

-- Service categories
INSERT INTO service_categories (id, name, slug, description, sort_order) VALUES
(1, 'Laser Hair Removal', 'laser-hair-removal', 'Permanent hair reduction using advanced laser technology tailored for all skin types.', 1),
(2, 'Heat Shock Detox', 'heat-shock-detox', 'Deep detoxification treatments using controlled thermal therapy.', 2),
(3, 'Skin Resurfacing', 'skin-resurfacing', 'Advanced treatments to renew and rejuvenate skin texture and tone.', 3),
(4, 'Body Contouring', 'body-contouring', 'Non-invasive body sculpting and fat reduction treatments.', 4),
(5, 'Facials', 'facials', 'Premium facial treatments for radiant, healthy skin.', 5) ON CONFLICT DO NOTHING;

SELECT setval('service_categories_id_seq', (SELECT MAX(id) FROM service_categories));

-- Services
INSERT INTO services (category_id, name, slug, short_description, duration_minutes, price_jmd, is_active, sort_order) VALUES
(1, 'Full Body Laser Hair Removal', 'full-body-laser-hair-removal', 'Complete full body permanent hair reduction session.', 180, 45000.00, TRUE, 1),
(1, 'Bikini Laser Hair Removal', 'bikini-laser-hair-removal', 'Precise laser hair removal for the bikini area.', 45, 12000.00, TRUE, 2),
(1, 'Underarm Laser Hair Removal', 'underarm-laser-hair-removal', 'Quick and effective underarm hair removal.', 30, 8000.00, TRUE, 3),
(1, 'Face & Neck Laser Hair Removal', 'face-neck-laser-hair-removal', 'Laser hair removal for face and neck area.', 45, 10000.00, TRUE, 4),
(2, 'Full Body Heat Shock Detox', 'full-body-heat-shock-detox', 'Comprehensive thermal detoxification treatment.', 90, 25000.00, TRUE, 1),
(3, 'Fractional Laser Resurfacing', 'fractional-laser-resurfacing', 'Advanced fractional laser for skin renewal and scar reduction.', 60, 35000.00, TRUE, 1),
(3, 'Chemical Peel', 'chemical-peel', 'Medical-grade chemical peel for brighter, smoother skin.', 45, 15000.00, TRUE, 2),
(4, 'Cryolipolysis Body Contouring', 'cryolipolysis-body-contouring', 'Non-surgical fat freezing body sculpting treatment.', 90, 40000.00, TRUE, 1),
(4, 'Radiofrequency Skin Tightening', 'rf-skin-tightening', 'RF energy tightening for firmer, smoother skin.', 60, 20000.00, TRUE, 2),
(5, 'HydraFacial MD', 'hydrafacial-md', 'Multi-step facial cleansing, exfoliation, and hydration treatment.', 75, 18000.00, TRUE, 1),
(5, 'LED Light Therapy Facial', 'led-light-therapy-facial', 'Targeted LED therapy for acne, anti-aging, and skin brightening.', 45, 10000.00, TRUE, 2) ON CONFLICT DO NOTHING;

-- Resources
INSERT INTO resources (location_id, name, type, description) VALUES
(1, 'Treatment Room A', 'room', 'Primary laser treatment room'),
(1, 'Treatment Room B', 'room', 'Secondary treatment room'),
(1, 'Consultation Room', 'room', 'Private consultation and intake room'),
(1, 'Nd:YAG Laser Machine', 'laser_machine', '1064nm / 532nm dual-wavelength laser'),
(1, 'Diode Laser Machine', 'laser_machine', '808nm diode laser for all skin types') ON CONFLICT DO NOTHING;

-- Membership plans
INSERT INTO membership_plans (name, plan_type, price_jmd, sessions_per_cycle, services_included, description) VALUES
('Monthly Glow Plan', 'monthly', 25000.00, 2, '[1,2,3]', 'Perfect for maintaining results with 2 sessions per month.'),
('Annual Luxury Plan', 'annual', 250000.00, 24, '[1,2,3,4,5]', 'Our best value — 24 sessions per year across all laser services.') ON CONFLICT DO NOTHING;

-- ─── BOOKING DRAFTS & BLOCKED DATES ───────────────────────────────────────────

CREATE TYPE booking_draft_step_enum AS ENUM (
  'service',
  'location',
  'type',
  'datetime',
  'details',
  'payment',
  'confirmation'
);

CREATE TABLE booking_drafts (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER NOT NULL UNIQUE,
  location_id             INTEGER DEFAULT NULL,
  employee_id             INTEGER DEFAULT NULL,
  service_ids             JSONB DEFAULT NULL,
  scheduled_date          DATE DEFAULT NULL,
  start_time              TIME DEFAULT NULL,
  customer_info           JSONB DEFAULT NULL,
  current_step            booking_draft_step_enum NOT NULL DEFAULT 'service',
  resume_prompt_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bd_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bd_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_bd_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);
CREATE INDEX idx_booking_drafts_updated_at ON booking_drafts (updated_at);

CREATE TRIGGER update_booking_drafts_modtime
  BEFORE UPDATE ON booking_drafts
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE blocked_dates (
  id           SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason       VARCHAR(255) DEFAULT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optional column used by some booking paths
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS service_id INTEGER DEFAULT NULL
  REFERENCES services(id) ON DELETE SET NULL;
