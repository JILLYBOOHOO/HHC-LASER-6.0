-- ============================================================================
--  HHC LASER MedSpa — MySQL 8 Production Schema
--  Database: hhc_laser
--  Charset:  utf8mb4 / COLLATE utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS hhc_laser
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hhc_laser;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── USERS & AUTHENTICATION ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) DEFAULT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  DEFAULT NULL,
  date_of_birth   DATE         DEFAULT NULL,
  profile_photo_url VARCHAR(512) DEFAULT NULL,
  google_id       VARCHAR(255) DEFAULT NULL UNIQUE,
  token_version   INT UNSIGNED NOT NULL DEFAULT 0,
  authentication_method ENUM('Email Password', 'Google OAuth') NOT NULL DEFAULT 'Email Password',
  last_login      DATETIME     DEFAULT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  email_verified  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  ENUM('developer','owner','admin','manager','specialist','staff','customer') NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (name) VALUES ('developer'),('owner'),('admin'),('manager'),('specialist'),('staff'),('customer');

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT UNSIGNED NOT NULL,
  role    ENUM('developer','owner','admin','manager','specialist','staff','customer') NOT NULL,
  PRIMARY KEY (user_id, role),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── LOCATIONS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  address         VARCHAR(500) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  parish          VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  email           VARCHAR(255) NOT NULL,
  google_maps_url VARCHAR(512) DEFAULT NULL,
  whatsapp_number VARCHAR(20)  DEFAULT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS business_hours (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id INT UNSIGNED NOT NULL,
  day_of_week TINYINT UNSIGNED NOT NULL COMMENT '0=Sunday,6=Saturday',
  open_time   TIME NOT NULL,
  close_time  TIME NOT NULL,
  is_closed   TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_loc_day (location_id, day_of_week),
  CONSTRAINT fk_bh_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS location_holidays (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id INT UNSIGNED NOT NULL,
  holiday_date DATE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  CONSTRAINT fk_lh_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── SERVICE CATALOG ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url    VARCHAR(512) DEFAULT NULL,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id           INT UNSIGNED NOT NULL,
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) NOT NULL UNIQUE,
  description           TEXT,
  short_description     VARCHAR(500),
  duration_minutes      SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  price_jmd             DECIMAL(10,2) NOT NULL,
  price_usd             DECIMAL(10,2) DEFAULT NULL,
  deposit_required      TINYINT(1)   NOT NULL DEFAULT 0,
  deposit_amount_jmd    DECIMAL(10,2) DEFAULT NULL,
  requires_consultation TINYINT(1)   NOT NULL DEFAULT 0,
  preparation_notes     TEXT DEFAULT NULL,
  aftercare_notes       TEXT DEFAULT NULL,
  thumbnail_url         VARCHAR(512) DEFAULT NULL,
  prep_video_url        VARCHAR(512) DEFAULT NULL,
  is_featured           TINYINT(1)   NOT NULL DEFAULT 0,
  is_active             TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  CONSTRAINT fk_svc_category FOREIGN KEY (category_id) REFERENCES service_categories(id)
) ENGINE=InnoDB;

-- ─── EMPLOYEES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employees (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id              INT UNSIGNED NOT NULL UNIQUE,
  location_id          INT UNSIGNED NOT NULL,
  title                VARCHAR(100) DEFAULT NULL,
  bio                  TEXT DEFAULT NULL,
  specializations      TEXT DEFAULT NULL,
  certifications       TEXT DEFAULT NULL,
  is_accepting_clients TINYINT(1)   NOT NULL DEFAULT 1,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_emp_location FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employee_services (
  employee_id INT UNSIGNED NOT NULL,
  service_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (employee_id, service_id),
  CONSTRAINT fk_es_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_es_svc FOREIGN KEY (service_id)  REFERENCES services(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employee_schedules (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  day_of_week TINYINT UNSIGNED NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_emp_loc_day (employee_id, location_id, day_of_week),
  CONSTRAINT fk_esc_emp      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_esc_location FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB;

-- ─── RESOURCES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resources (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id INT UNSIGNED NOT NULL,
  name        VARCHAR(255) NOT NULL,
  type        ENUM('room','laser_machine','equipment') NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT fk_res_location FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB;

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_type       ENUM('self','other','group') NOT NULL DEFAULT 'self',
  group_id           VARCHAR(36) DEFAULT NULL COMMENT 'UUID groups linked group appointments',
  customer_user_id   INT UNSIGNED NOT NULL,
  booked_for_user_id INT UNSIGNED DEFAULT NULL COMMENT 'Guest if booked for someone else',
  employee_id        INT UNSIGNED NOT NULL,
  location_id        INT UNSIGNED NOT NULL,
  resource_id        INT UNSIGNED DEFAULT NULL,
  scheduled_date     DATE NOT NULL,
  start_time         TIME NOT NULL,
  end_time           TIME NOT NULL,
  status             ENUM('pending','confirmed','checked_in','in_treatment','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  notes              TEXT DEFAULT NULL,
  total_amount_jmd   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  deposit_paid_jmd   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date       (scheduled_date),
  INDEX idx_customer   (customer_user_id),
  INDEX idx_employee   (employee_id),
  INDEX idx_status     (status),
  INDEX idx_group      (group_id),
  CONSTRAINT fk_appt_customer  FOREIGN KEY (customer_user_id)   REFERENCES users(id),
  CONSTRAINT fk_appt_employee  FOREIGN KEY (employee_id)        REFERENCES employees(id),
  CONSTRAINT fk_appt_location  FOREIGN KEY (location_id)        REFERENCES locations(id),
  CONSTRAINT fk_appt_resource  FOREIGN KEY (resource_id)        REFERENCES resources(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment_services (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT UNSIGNED NOT NULL,
  service_id     INT UNSIGNED NOT NULL,
  price_jmd      DECIMAL(10,2) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL,
  CONSTRAINT fk_aps_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_aps_svc  FOREIGN KEY (service_id)     REFERENCES services(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment_guests (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT UNSIGNED NOT NULL,
  group_id       VARCHAR(36) NOT NULL,
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(255) DEFAULT NULL,
  phone          VARCHAR(20)  DEFAULT NULL,
  CONSTRAINT fk_ag_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment_status_log (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id      INT UNSIGNED NOT NULL,
  old_status          ENUM('pending','confirmed','checked_in','in_treatment','completed','cancelled','no_show') DEFAULT NULL,
  new_status          ENUM('pending','confirmed','checked_in','in_treatment','completed','cancelled','no_show') NOT NULL,
  changed_by_user_id  INT UNSIGNED DEFAULT NULL,
  changed_by_system   TINYINT(1) NOT NULL DEFAULT 0,
  notes               VARCHAR(500) DEFAULT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_asl_appt (appointment_id),
  CONSTRAINT fk_asl_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── TRANSACTIONS / PAYMENTS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS transactions (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id       INT UNSIGNED DEFAULT NULL,
  customer_user_id     INT UNSIGNED NOT NULL,
  fiserv_txn_id        VARCHAR(255) DEFAULT NULL,
  idempotency_key      VARCHAR(64)  NOT NULL UNIQUE,
  amount_jmd           DECIMAL(10,2) NOT NULL,
  currency             VARCHAR(3)   NOT NULL DEFAULT 'JMD',
  status               ENUM('pending','completed','failed','refunded','partial') NOT NULL DEFAULT 'pending',
  payment_method       VARCHAR(50)  DEFAULT NULL,
  fiserv_approval_code VARCHAR(50)  DEFAULT NULL,
  fiserv_response_code VARCHAR(10)  DEFAULT NULL,
  notes                VARCHAR(500) DEFAULT NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- NOTE: Card numbers and CVV are NEVER stored here.
  INDEX idx_txn_customer (customer_user_id),
  INDEX idx_txn_appt     (appointment_id),
  INDEX idx_txn_status   (status),
  CONSTRAINT fk_txn_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_txn_customer FOREIGN KEY (customer_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─── MEMBERSHIPS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS membership_plans (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  plan_type           ENUM('monthly','annual') NOT NULL,
  price_jmd           DECIMAL(10,2) NOT NULL,
  sessions_per_cycle  TINYINT UNSIGNED NOT NULL DEFAULT 4,
  services_included   TEXT NOT NULL COMMENT 'JSON array of service IDs',
  description         TEXT,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_memberships (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_user_id    INT UNSIGNED NOT NULL,
  plan_id             INT UNSIGNED NOT NULL,
  status              ENUM('active','paused','cancelled','expired') NOT NULL DEFAULT 'active',
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  sessions_remaining  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  auto_renew          TINYINT(1) NOT NULL DEFAULT 1,
  last_transaction_id INT UNSIGNED DEFAULT NULL,
  created_at          DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cm_customer (customer_user_id),
  CONSTRAINT fk_cm_customer FOREIGN KEY (customer_user_id)    REFERENCES users(id),
  CONSTRAINT fk_cm_plan     FOREIGN KEY (plan_id)             REFERENCES membership_plans(id),
  CONSTRAINT fk_cm_txn      FOREIGN KEY (last_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── PACKAGES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS packages (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id   INT UNSIGNED NOT NULL,
  name         VARCHAR(255) NOT NULL,
  sessions     TINYINT UNSIGNED NOT NULL,
  price_jmd    DECIMAL(10,2) NOT NULL,
  validity_days SMALLINT UNSIGNED NOT NULL DEFAULT 365,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT fk_pkg_svc FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_packages (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_user_id     INT UNSIGNED NOT NULL,
  package_id           INT UNSIGNED NOT NULL,
  sessions_remaining   TINYINT UNSIGNED NOT NULL,
  purchase_date        DATE NOT NULL,
  expiry_date          DATE NOT NULL,
  purchase_transaction_id INT UNSIGNED DEFAULT NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cp_customer FOREIGN KEY (customer_user_id)         REFERENCES users(id),
  CONSTRAINT fk_cp_package  FOREIGN KEY (package_id)               REFERENCES packages(id),
  CONSTRAINT fk_cp_txn      FOREIGN KEY (purchase_transaction_id)  REFERENCES transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS intake_forms (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_user_id     INT UNSIGNED NOT NULL,
  appointment_id       INT UNSIGNED DEFAULT NULL,
  fitzpatrick_type     ENUM('I','II','III','IV','V','VI') DEFAULT NULL,
  skin_conditions      TEXT DEFAULT NULL,
  allergies            TEXT DEFAULT NULL,
  medications          TEXT DEFAULT NULL,
  contraindications    TEXT DEFAULT NULL,
  previous_treatments  TEXT DEFAULT NULL,
  pregnancy_status     TINYINT(1) NOT NULL DEFAULT 0,
  pacemaker_status     TINYINT(1) NOT NULL DEFAULT 0,
  keloid_history       TINYINT(1) NOT NULL DEFAULT 0,
  sun_exposure_recent  TINYINT(1) NOT NULL DEFAULT 0,
  additional_notes     TEXT DEFAULT NULL,
  submitted_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_if_customer (customer_user_id),
  CONSTRAINT fk_if_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_if_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS treatment_notes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id   INT UNSIGNED NOT NULL,
  employee_id      INT UNSIGNED NOT NULL,
  customer_user_id INT UNSIGNED NOT NULL,
  service_id       INT UNSIGNED NOT NULL,
  notes            TEXT NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tn_customer (customer_user_id),
  INDEX idx_tn_appt     (appointment_id),
  CONSTRAINT fk_tn_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id),
  CONSTRAINT fk_tn_emp      FOREIGN KEY (employee_id)      REFERENCES employees(id),
  CONSTRAINT fk_tn_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_tn_service  FOREIGN KEY (service_id)       REFERENCES services(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS laser_settings (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  treatment_note_id INT UNSIGNED NOT NULL,
  body_area         VARCHAR(100) NOT NULL,
  fluence           DECIMAL(6,2) NOT NULL COMMENT 'J/cm²',
  pulse_width       DECIMAL(6,2) NOT NULL COMMENT 'milliseconds',
  frequency_hz      DECIMAL(6,2) NOT NULL COMMENT 'Hz',
  spot_size_mm      DECIMAL(5,2) NOT NULL COMMENT 'millimeters',
  passes            TINYINT UNSIGNED NOT NULL DEFAULT 1,
  skin_reaction     VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_ls_note FOREIGN KEY (treatment_note_id) REFERENCES treatment_notes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS before_after_photos (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT UNSIGNED NOT NULL,
  employee_id    INT UNSIGNED NOT NULL,
  body_area      VARCHAR(100) NOT NULL,
  before_url     VARCHAR(512) DEFAULT NULL COMMENT 'AWS S3 URL',
  after_url      VARCHAR(512) DEFAULT NULL COMMENT 'AWS S3 URL',
  notes          TEXT DEFAULT NULL,
  is_public      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'If 1, can appear in public gallery with consent',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bap_appt (appointment_id),
  CONSTRAINT fk_bap_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  CONSTRAINT fk_bap_emp  FOREIGN KEY (employee_id)    REFERENCES employees(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consent_forms (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_user_id INT UNSIGNED NOT NULL,
  appointment_id   INT UNSIGNED NOT NULL,
  service_id       INT UNSIGNED NOT NULL,
  form_version     VARCHAR(10)  NOT NULL DEFAULT '1.0',
  pdf_url          VARCHAR(512) DEFAULT NULL COMMENT 'Signed PDF on S3',
  ip_address       VARCHAR(45)  DEFAULT NULL,
  signed_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cf_customer (customer_user_id),
  CONSTRAINT fk_cf_customer FOREIGN KEY (customer_user_id) REFERENCES users(id),
  CONSTRAINT fk_cf_appt     FOREIGN KEY (appointment_id)   REFERENCES appointments(id),
  CONSTRAINT fk_cf_service  FOREIGN KEY (service_id)       REFERENCES services(id)
) ENGINE=InnoDB;

-- ─── CMS ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cms_content (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`      VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., hero_title, promo_banner_text',
  type       ENUM('text','html','image_url','json') NOT NULL DEFAULT 'text',
  value      MEDIUMTEXT NOT NULL,
  label      VARCHAR(255) NOT NULL COMMENT 'Human-readable label for admin UI',
  updated_by INT UNSIGNED NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cms_user FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gallery_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_url   VARCHAR(512) NOT NULL,
  alt_text    VARCHAR(255) NOT NULL,
  category    VARCHAR(100) DEFAULT NULL COMMENT 'e.g., laser-hair-removal, body-contouring',
  is_featured TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS testimonials (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  rating       TINYINT UNSIGNED NOT NULL DEFAULT 5,
  content      TEXT NOT NULL,
  service_name VARCHAR(255) DEFAULT NULL,
  photo_url    VARCHAR(512) DEFAULT NULL,
  is_featured  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promotions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  discount_pct TINYINT UNSIGNED DEFAULT NULL,
  discount_jmd DECIMAL(10,2) DEFAULT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  image_url    VARCHAR(512) DEFAULT NULL,
  service_ids  TEXT DEFAULT NULL COMMENT 'JSON array of applicable service IDs',
  promo_code   VARCHAR(50)  DEFAULT NULL UNIQUE,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_promo_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ─── NOTIFICATIONS & AUDIT ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications_log (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type       ENUM('email','sms','push') NOT NULL,
  recipient  VARCHAR(255) NOT NULL,
  subject    VARCHAR(500) NOT NULL,
  status     ENUM('sent','failed','pending') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nl_type   (type),
  INDEX idx_nl_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED DEFAULT NULL,
  action      VARCHAR(100) NOT NULL COMMENT 'e.g., USER_LOGIN, APPOINTMENT_CREATED',
  entity_type VARCHAR(50)  DEFAULT NULL,
  entity_id   INT UNSIGNED DEFAULT NULL,
  old_values  JSON DEFAULT NULL,
  new_values  JSON DEFAULT NULL,
  ip_address  VARCHAR(45)  DEFAULT NULL,
  user_agent  VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_user   (user_id),
  INDEX idx_al_action (action),
  INDEX idx_al_entity (entity_type, entity_id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ─── CMS & DEVELOPER DASHBOARD ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS business_settings (
  setting_key   VARCHAR(100) PRIMARY KEY,
  setting_value JSON NOT NULL,
  description   VARCHAR(255) DEFAULT NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_name     VARCHAR(255) NOT NULL,
  file_url      VARCHAR(512) NOT NULL,
  file_type     ENUM('image','video','document') NOT NULL DEFAULT 'image',
  mime_type     VARCHAR(100) NOT NULL,
  size_bytes    INT UNSIGNED NOT NULL,
  uploaded_by   INT UNSIGNED DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS homepage_sections (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_type  VARCHAR(50) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  config_json   JSON DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS error_logs (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  error_type    VARCHAR(100) NOT NULL,
  message       TEXT NOT NULL,
  stack_trace   TEXT DEFAULT NULL,
  user_id       INT UNSIGNED DEFAULT NULL,
  endpoint      VARCHAR(255) DEFAULT NULL,
  method        VARCHAR(10) DEFAULT NULL,
  status        ENUM('open','resolved','ignored') NOT NULL DEFAULT 'open',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at   DATETIME DEFAULT NULL,
  CONSTRAINT fk_err_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
-- ─── SEED DATA ────────────────────────────────────────────────────────────────

-- Default location
INSERT IGNORE INTO locations (id, name, address, city, parish, phone, email, whatsapp_number) VALUES
(1, 'HHC LASER Kingston', '123 Constant Spring Road', 'Kingston', 'Kingston', '+1-876-555-0100', 'kingston@hhclaser.com', '+18765550100');

-- Business hours (Mon-Sat, 9am-6pm)
INSERT IGNORE INTO business_hours (location_id, day_of_week, open_time, close_time, is_closed)
VALUES
(1, 0, '09:00:00', '18:00:00', 1),  -- Sunday closed
(1, 1, '09:00:00', '18:00:00', 0),
(1, 2, '09:00:00', '18:00:00', 0),
(1, 3, '09:00:00', '18:00:00', 0),
(1, 4, '09:00:00', '18:00:00', 0),
(1, 5, '09:00:00', '18:00:00', 0),
(1, 6, '10:00:00', '16:00:00', 0);  -- Saturday half-day

-- Service categories
INSERT IGNORE INTO service_categories (name, slug, description, sort_order) VALUES
('Laser Hair Removal', 'laser-hair-removal', 'Permanent hair reduction using advanced laser technology tailored for all skin types.', 1),
('Heat Shock Detox', 'heat-shock-detox', 'Deep detoxification treatments using controlled thermal therapy.', 2),
('Skin Resurfacing', 'skin-resurfacing', 'Advanced treatments to renew and rejuvenate skin texture and tone.', 3),
('Body Contouring', 'body-contouring', 'Non-invasive body sculpting and fat reduction treatments.', 4),
('Facials', 'facials', 'Premium facial treatments for radiant, healthy skin.', 5);

-- Services
INSERT IGNORE INTO services (category_id, name, slug, short_description, duration_minutes, price_jmd, is_active, sort_order) VALUES
(1, 'Full Body Laser Hair Removal', 'full-body-laser-hair-removal', 'Complete full body permanent hair reduction session.', 180, 45000.00, 1, 1),
(1, 'Bikini Laser Hair Removal', 'bikini-laser-hair-removal', 'Precise laser hair removal for the bikini area.', 45, 12000.00, 1, 2),
(1, 'Underarm Laser Hair Removal', 'underarm-laser-hair-removal', 'Quick and effective underarm hair removal.', 30, 8000.00, 1, 3),
(1, 'Face & Neck Laser Hair Removal', 'face-neck-laser-hair-removal', 'Laser hair removal for face and neck area.', 45, 10000.00, 1, 4),
(2, 'Full Body Heat Shock Detox', 'full-body-heat-shock-detox', 'Comprehensive thermal detoxification treatment.', 90, 25000.00, 1, 1),
(3, 'Fractional Laser Resurfacing', 'fractional-laser-resurfacing', 'Advanced fractional laser for skin renewal and scar reduction.', 60, 35000.00, 1, 1),
(3, 'Chemical Peel', 'chemical-peel', 'Medical-grade chemical peel for brighter, smoother skin.', 45, 15000.00, 1, 2),
(4, 'Cryolipolysis Body Contouring', 'cryolipolysis-body-contouring', 'Non-surgical fat freezing body sculpting treatment.', 90, 40000.00, 1, 1),
(4, 'Radiofrequency Skin Tightening', 'rf-skin-tightening', 'RF energy tightening for firmer, smoother skin.', 60, 20000.00, 1, 2),
(5, 'HydraFacial MD', 'hydrafacial-md', 'Multi-step facial cleansing, exfoliation, and hydration treatment.', 75, 18000.00, 1, 1),
(5, 'LED Light Therapy Facial', 'led-light-therapy-facial', 'Targeted LED therapy for acne, anti-aging, and skin brightening.', 45, 10000.00, 1, 2);

-- Resources
INSERT IGNORE INTO resources (location_id, name, type, description) VALUES
(1, 'Treatment Room A', 'room', 'Primary laser treatment room'),
(1, 'Treatment Room B', 'room', 'Secondary treatment room'),
(1, 'Consultation Room', 'room', 'Private consultation and intake room'),
(1, 'Nd:YAG Laser Machine', 'laser_machine', '1064nm / 532nm dual-wavelength laser'),
(1, 'Diode Laser Machine', 'laser_machine', '808nm diode laser for all skin types');

-- Membership plans
INSERT IGNORE INTO membership_plans (name, plan_type, price_jmd, sessions_per_cycle, services_included, description) VALUES
('Monthly Glow Plan', 'monthly', 25000.00, 2, '[1,2,3]', 'Perfect for maintaining results with 2 sessions per month.'),
('Annual Luxury Plan', 'annual', 250000.00, 24, '[1,2,3,4,5]', 'Our best value — 24 sessions per year across all laser services.');

-- -----------------------------------------------------------------------------
-- FEATURED PRODUCTS SECTION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prodcat_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id      INT UNSIGNED NOT NULL,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  price_jmd        DECIMAL(10,2) NOT NULL,
  stock_quantity   INT NOT NULL DEFAULT 0,
  image_url        VARCHAR(512) DEFAULT NULL,
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_prod_slug (slug),
  INDEX idx_prod_cat (category_id),
  CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB;
