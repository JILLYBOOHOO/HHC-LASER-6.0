-- Migration: Create booking_drafts table
-- Run once against your MySQL database.
-- Each user can have at most ONE active draft (one row per user_id).

CREATE TABLE IF NOT EXISTS booking_drafts (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id                BIGINT UNSIGNED NOT NULL,
  location_id            INT UNSIGNED    DEFAULT NULL,
  employee_id            INT UNSIGNED    DEFAULT NULL,
  service_ids            JSON            DEFAULT NULL,   -- e.g. [1, 3, 7]
  scheduled_date         DATE            DEFAULT NULL,
  start_time             TIME            DEFAULT NULL,
  customer_info          JSON            DEFAULT NULL,   -- partial CreateBookingDto fields
  current_step           ENUM(
                           'service',
                           'location',
                           'type',
                           'datetime',
                           'details',
                           'payment',
                           'confirmation'
                         ) NOT NULL DEFAULT 'service',
  resume_prompt_dismissed TINYINT(1) NOT NULL DEFAULT 0,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_draft (user_id),        -- one draft per user
  INDEX idx_updated_at    (updated_at)       -- for expiration cleanup queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
