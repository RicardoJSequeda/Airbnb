CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS bookings;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS listings;
CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE users.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_tenant_id ON users.organizations (tenant_id);
CREATE INDEX idx_organizations_tenant_created_at_desc ON users.organizations (tenant_id, created_at DESC);

CREATE TABLE users.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  name TEXT NOT NULL,
  avatar TEXT,
  occupation TEXT,
  bio TEXT,
  registration_number TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'GUEST' CHECK (role IN ('GUEST','HOST','ADMIN','SUPER_ADMIN')),
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
  supabase_id TEXT UNIQUE,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_users_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_tenant_id ON users.users (tenant_id);
CREATE INDEX idx_users_tenant_created_at_desc ON users.users (tenant_id, created_at DESC);
CREATE INDEX idx_users_supabase_id ON users.users (supabase_id);
CREATE INDEX idx_users_organization_id ON users.users (organization_id);

CREATE TABLE users.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  organization_id UUID NOT NULL,
  plan VARCHAR(20) NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE','PRO','ENTERPRISE')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELED','PAST_DUE')),
  stripe_customer_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_subscriptions_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_tenant_id ON users.subscriptions (tenant_id);
CREATE INDEX idx_subscriptions_tenant_created_at_desc ON users.subscriptions (tenant_id, created_at DESC);
CREATE INDEX idx_subscriptions_organization_id ON users.subscriptions (organization_id);
CREATE INDEX idx_subscriptions_status_active ON users.subscriptions (organization_id, created_at DESC) WHERE status = 'ACTIVE';

CREATE TABLE listings.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country VARCHAR(8) NOT NULL DEFAULT 'CO',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_tenant_id ON listings.departments (tenant_id);
CREATE INDEX idx_departments_tenant_created_at_desc ON listings.departments (tenant_id, created_at DESC);
CREATE INDEX idx_departments_active ON listings.departments (display_order, created_at DESC) WHERE is_active = TRUE;

CREATE TABLE listings.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  department_id UUID NOT NULL,
  suggestion_description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  search_count INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cities_slug_department UNIQUE (slug, department_id),
  CONSTRAINT fk_cities_department FOREIGN KEY (department_id) REFERENCES listings.departments(id) ON DELETE CASCADE
);

CREATE INDEX idx_cities_tenant_id ON listings.cities (tenant_id);
CREATE INDEX idx_cities_tenant_created_at_desc ON listings.cities (tenant_id, created_at DESC);
CREATE INDEX idx_cities_department_id ON listings.cities (department_id);
CREATE INDEX idx_cities_slug ON listings.cities (slug);
CREATE INDEX idx_cities_active ON listings.cities (department_id, display_order, created_at DESC) WHERE is_active = TRUE;

CREATE TABLE listings.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  city_id UUID NOT NULL,
  suggestion_description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_places_city FOREIGN KEY (city_id) REFERENCES listings.cities(id) ON DELETE CASCADE
);

CREATE INDEX idx_places_tenant_id ON listings.places (tenant_id);
CREATE INDEX idx_places_tenant_created_at_desc ON listings.places (tenant_id, created_at DESC);
CREATE INDEX idx_places_city_id ON listings.places (city_id);
CREATE INDEX idx_places_active ON listings.places (city_id, display_order, created_at DESC) WHERE is_active = TRUE;

CREATE TABLE listings.location_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  city_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_location_search_logs_city FOREIGN KEY (city_id) REFERENCES listings.cities(id) ON DELETE CASCADE
);

CREATE INDEX idx_location_search_logs_tenant_id ON listings.location_search_logs (tenant_id);
CREATE INDEX idx_location_search_logs_tenant_created_at_desc ON listings.location_search_logs (tenant_id, created_at DESC);
CREATE INDEX idx_location_search_logs_city_id ON listings.location_search_logs (city_id);

CREATE TABLE listings.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  max_guests INT NOT NULL CHECK (max_guests > 0),
  bedrooms INT NOT NULL CHECK (bedrooms >= 0),
  bathrooms INT NOT NULL CHECK (bathrooms >= 0),
  property_type TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  zip_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  host_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  amenities TEXT NOT NULL,
  images TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_properties_host FOREIGN KEY (host_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_properties_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_properties_tenant_id ON listings.properties (tenant_id);
CREATE INDEX idx_properties_tenant_created_at_desc ON listings.properties (tenant_id, created_at DESC);
CREATE INDEX idx_properties_host_id ON listings.properties (host_id);
CREATE INDEX idx_properties_organization_id ON listings.properties (organization_id);
CREATE INDEX idx_properties_city_country ON listings.properties (city, country);
CREATE INDEX idx_properties_property_type ON listings.properties (property_type);
CREATE INDEX idx_properties_status_active ON listings.properties (tenant_id, created_at DESC) WHERE status = 'ACTIVE';

CREATE TABLE bookings.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  property_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  guests INT NOT NULL CHECK (guests > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','REJECTED','CANCELLED','COMPLETED','REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_booking_dates CHECK (check_out > check_in),
  CONSTRAINT fk_bookings_property FOREIGN KEY (property_id) REFERENCES listings.properties(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_bookings_tenant_id ON bookings.bookings (tenant_id);
CREATE INDEX idx_bookings_tenant_created_at_desc ON bookings.bookings (tenant_id, created_at DESC);
CREATE INDEX idx_bookings_property_id ON bookings.bookings (property_id);
CREATE INDEX idx_bookings_guest_id ON bookings.bookings (guest_id);
CREATE INDEX idx_bookings_organization_id ON bookings.bookings (organization_id);
CREATE INDEX idx_bookings_status ON bookings.bookings (status);
CREATE INDEX idx_bookings_property_check_range ON bookings.bookings (property_id, check_in, check_out);
CREATE INDEX idx_bookings_check_range ON bookings.bookings (check_in, check_out);
CREATE INDEX idx_bookings_confirmed_partial ON bookings.bookings (tenant_id, check_in, created_at DESC) WHERE status = 'CONFIRMED';

CREATE TABLE payments.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  booking_id UUID NOT NULL UNIQUE,
  organization_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED','CANCELLED')),
  paid_at TIMESTAMPTZ,
  platform_fee_amount NUMERIC(10,2),
  host_net_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings.bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_payments_tenant_id ON payments.payments (tenant_id);
CREATE INDEX idx_payments_tenant_created_at_desc ON payments.payments (tenant_id, created_at DESC);
CREATE INDEX idx_payments_booking_id ON payments.payments (booking_id);
CREATE INDEX idx_payments_organization_id ON payments.payments (organization_id);
CREATE INDEX idx_payments_status ON payments.payments (status);
CREATE INDEX idx_payments_completed_partial ON payments.payments (tenant_id, paid_at DESC) WHERE status = 'COMPLETED';

CREATE TABLE listings.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  booking_id UUID NOT NULL UNIQUE,
  property_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings.bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_property FOREIGN KEY (property_id) REFERENCES listings.properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_guest FOREIGN KEY (guest_id) REFERENCES users.users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_reviews_tenant_id ON listings.reviews (tenant_id);
CREATE INDEX idx_reviews_tenant_created_at_desc ON listings.reviews (tenant_id, created_at DESC);
CREATE INDEX idx_reviews_booking_id ON listings.reviews (booking_id);
CREATE INDEX idx_reviews_property_id ON listings.reviews (property_id);
CREATE INDEX idx_reviews_guest_id ON listings.reviews (guest_id);

CREATE TABLE listings.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_favorites_user_property UNIQUE (user_id, property_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_property FOREIGN KEY (property_id) REFERENCES listings.properties(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorites_tenant_id ON listings.favorites (tenant_id);
CREATE INDEX idx_favorites_tenant_created_at_desc ON listings.favorites (tenant_id, created_at DESC);
CREATE INDEX idx_favorites_user_id ON listings.favorites (user_id);
CREATE INDEX idx_favorites_property_id ON listings.favorites (property_id);

CREATE TABLE listings.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_per_participant NUMERIC(10,2) NOT NULL CHECK (price_per_participant >= 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  max_participants INT NOT NULL CHECK (max_participants > 0),
  duration INT NOT NULL CHECK (duration > 0),
  category TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  zip_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  host_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  includes TEXT NOT NULL,
  excludes TEXT,
  images TEXT NOT NULL,
  meeting_point TEXT,
  languages TEXT,
  age_restriction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_experiences_host FOREIGN KEY (host_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_experiences_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_experiences_tenant_id ON listings.experiences (tenant_id);
CREATE INDEX idx_experiences_tenant_created_at_desc ON listings.experiences (tenant_id, created_at DESC);
CREATE INDEX idx_experiences_host_id ON listings.experiences (host_id);
CREATE INDEX idx_experiences_organization_id ON listings.experiences (organization_id);
CREATE INDEX idx_experiences_city_country ON listings.experiences (city, country);
CREATE INDEX idx_experiences_category ON listings.experiences (category);
CREATE INDEX idx_experiences_status ON listings.experiences (status);
CREATE INDEX idx_experiences_active_partial ON listings.experiences (tenant_id, created_at DESC) WHERE status = 'ACTIVE';

CREATE TABLE listings.experience_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  experience_id UUID NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time VARCHAR(16) NOT NULL,
  end_time VARCHAR(16),
  available_spots INT NOT NULL CHECK (available_spots >= 0),
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_experience_slots_experience FOREIGN KEY (experience_id) REFERENCES listings.experiences(id) ON DELETE CASCADE
);

CREATE INDEX idx_experience_slots_tenant_id ON listings.experience_slots (tenant_id);
CREATE INDEX idx_experience_slots_tenant_created_at_desc ON listings.experience_slots (tenant_id, created_at DESC);
CREATE INDEX idx_experience_slots_experience_id ON listings.experience_slots (experience_id);
CREATE INDEX idx_experience_slots_date ON listings.experience_slots (date);
CREATE INDEX idx_experience_slots_day_of_week ON listings.experience_slots (day_of_week);

CREATE TABLE bookings.experience_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  experience_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  participants INT NOT NULL CHECK (participants > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','REJECTED','CANCELLED','COMPLETED','REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_experience_bookings_experience FOREIGN KEY (experience_id) REFERENCES listings.experiences(id) ON DELETE RESTRICT,
  CONSTRAINT fk_experience_bookings_guest FOREIGN KEY (guest_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_experience_bookings_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_experience_bookings_tenant_id ON bookings.experience_bookings (tenant_id);
CREATE INDEX idx_experience_bookings_tenant_created_at_desc ON bookings.experience_bookings (tenant_id, created_at DESC);
CREATE INDEX idx_experience_bookings_experience_id ON bookings.experience_bookings (experience_id);
CREATE INDEX idx_experience_bookings_guest_id ON bookings.experience_bookings (guest_id);
CREATE INDEX idx_experience_bookings_organization_id ON bookings.experience_bookings (organization_id);
CREATE INDEX idx_experience_bookings_status ON bookings.experience_bookings (status);
CREATE INDEX idx_experience_bookings_date ON bookings.experience_bookings (date);

CREATE TABLE payments.experience_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  booking_id UUID NOT NULL UNIQUE,
  organization_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED','CANCELLED')),
  paid_at TIMESTAMPTZ,
  platform_fee_amount NUMERIC(10,2),
  host_net_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_experience_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings.experience_bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_experience_payments_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_experience_payments_tenant_id ON payments.experience_payments (tenant_id);
CREATE INDEX idx_experience_payments_tenant_created_at_desc ON payments.experience_payments (tenant_id, created_at DESC);
CREATE INDEX idx_experience_payments_booking_id ON payments.experience_payments (booking_id);
CREATE INDEX idx_experience_payments_organization_id ON payments.experience_payments (organization_id);
CREATE INDEX idx_experience_payments_status ON payments.experience_payments (status);

CREATE TABLE listings.experience_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  booking_id UUID NOT NULL UNIQUE,
  experience_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_experience_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings.experience_bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_experience_reviews_experience FOREIGN KEY (experience_id) REFERENCES listings.experiences(id) ON DELETE CASCADE,
  CONSTRAINT fk_experience_reviews_guest FOREIGN KEY (guest_id) REFERENCES users.users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_experience_reviews_tenant_id ON listings.experience_reviews (tenant_id);
CREATE INDEX idx_experience_reviews_tenant_created_at_desc ON listings.experience_reviews (tenant_id, created_at DESC);
CREATE INDEX idx_experience_reviews_booking_id ON listings.experience_reviews (booking_id);
CREATE INDEX idx_experience_reviews_experience_id ON listings.experience_reviews (experience_id);
CREATE INDEX idx_experience_reviews_guest_id ON listings.experience_reviews (guest_id);

CREATE TABLE bookings.booking_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE,
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  property_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  host_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_booking_summaries_booking FOREIGN KEY (booking_id) REFERENCES bookings.bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_summaries_property FOREIGN KEY (property_id) REFERENCES listings.properties(id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_summaries_guest FOREIGN KEY (guest_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_summaries_host FOREIGN KEY (host_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_summaries_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_booking_summaries_tenant_id ON bookings.booking_summaries (tenant_id);
CREATE INDEX idx_booking_summaries_tenant_created_at_desc ON bookings.booking_summaries (tenant_id, created_at DESC);
CREATE INDEX idx_booking_summaries_guest_created_at_desc ON bookings.booking_summaries (guest_id, created_at DESC);
CREATE INDEX idx_booking_summaries_host_created_at_desc ON bookings.booking_summaries (host_id, created_at DESC);
CREATE INDEX idx_booking_summaries_tenant_status ON bookings.booking_summaries (tenant_id, status);
CREATE INDEX idx_booking_summaries_booking_id ON bookings.booking_summaries (booking_id);
CREATE INDEX idx_booking_summaries_property_id ON bookings.booking_summaries (property_id);
CREATE INDEX idx_booking_summaries_organization_id ON bookings.booking_summaries (organization_id);

CREATE TABLE payments.payment_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL UNIQUE,
  booking_id UUID NOT NULL UNIQUE,
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  organization_id UUID NOT NULL,
  guest_id UUID,
  host_id UUID,
  status VARCHAR(20) NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(8) NOT NULL,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_payment_summaries_payment FOREIGN KEY (payment_id) REFERENCES payments.payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_summaries_booking FOREIGN KEY (booking_id) REFERENCES bookings.bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_summaries_organization FOREIGN KEY (organization_id) REFERENCES users.organizations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_summaries_guest FOREIGN KEY (guest_id) REFERENCES users.users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_summaries_host FOREIGN KEY (host_id) REFERENCES users.users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_payment_summaries_tenant_id ON payments.payment_summaries (tenant_id);
CREATE INDEX idx_payment_summaries_tenant_created_at_desc ON payments.payment_summaries (tenant_id, created_at DESC);
CREATE INDEX idx_payment_summaries_guest_created_at_desc ON payments.payment_summaries (guest_id, created_at DESC);
CREATE INDEX idx_payment_summaries_host_created_at_desc ON payments.payment_summaries (host_id, created_at DESC);
CREATE INDEX idx_payment_summaries_tenant_status ON payments.payment_summaries (tenant_id, status);
CREATE INDEX idx_payment_summaries_payment_id ON payments.payment_summaries (payment_id);
CREATE INDEX idx_payment_summaries_booking_id ON payments.payment_summaries (booking_id);
CREATE INDEX idx_payment_summaries_organization_id ON payments.payment_summaries (organization_id);

CREATE TABLE platform.outbox_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type VARCHAR(150) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global'
);

CREATE INDEX idx_outbox_events_processed_at_nulls_first ON platform.outbox_events (processed_at NULLS FIRST);
CREATE INDEX idx_outbox_events_aggregate_type_created_at ON platform.outbox_events (aggregate_type, created_at);
CREATE INDEX idx_outbox_events_tenant_created_at ON platform.outbox_events (tenant_id, created_at);
CREATE INDEX idx_outbox_events_tenant_id ON platform.outbox_events (tenant_id);

CREATE TABLE platform.idempotency_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key VARCHAR(255) NOT NULL,
  actor_id UUID NOT NULL,
  operation VARCHAR(100) NOT NULL,
  payload_hash VARCHAR(128) NOT NULL,
  response_payload JSONB,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  CONSTRAINT uq_idempotency_key_actor UNIQUE (idempotency_key, actor_id)
);

CREATE INDEX idx_idempotency_records_tenant_created_at_desc ON platform.idempotency_records (tenant_id, created_at DESC);
CREATE INDEX idx_idempotency_records_expires_at ON platform.idempotency_records (expires_at);
CREATE INDEX idx_idempotency_records_status ON platform.idempotency_records (status);
CREATE INDEX idx_idempotency_records_tenant_id ON platform.idempotency_records (tenant_id);

CREATE TABLE platform.consumed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  consumer_name VARCHAR(100) NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id UUID NOT NULL,
  region_id VARCHAR(32) NOT NULL DEFAULT 'global',
  CONSTRAINT uq_consumed_event_consumer UNIQUE (event_id, consumer_name),
  CONSTRAINT fk_consumed_events_outbox_event FOREIGN KEY (event_id) REFERENCES platform.outbox_events(event_id) ON DELETE CASCADE
);

CREATE INDEX idx_consumed_events_tenant_id ON platform.consumed_events (tenant_id);
CREATE INDEX idx_consumed_events_tenant_created_at_desc ON platform.consumed_events (tenant_id, processed_at DESC);
CREATE INDEX idx_consumed_events_event_id ON platform.consumed_events (event_id);
