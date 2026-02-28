-- ============================================
-- Script maestro para recrear el esquema completo en Supabase
-- Combina:
-- - Migración inicial (users, properties, bookings, payments, reviews, favorites)
-- - Migración multi-tenant (organizations, subscriptions, organizationId, índices)
-- - Tablas de experiencias (manual_experiences_tables.sql)
-- - Tabla outbox_events para Outbox Pattern
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================

-- Habilitar extensión pgvector para búsqueda vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- (Opcional) Crear schemas lógicos para microservicios
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS property;
CREATE SCHEMA IF NOT EXISTS booking;
CREATE SCHEMA IF NOT EXISTS payment;

-- ============================================
-- 1) Migración inicial: tablas base
--    (basado en 20260216000000_init_postgresql/migration.sql)
-- ============================================

-- CreateTable users
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'GUEST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable properties
CREATE TABLE IF NOT EXISTS "properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxGuests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "propertyType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "hostId" UUID NOT NULL,
    "amenities" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable bookings
CREATE TABLE IF NOT EXISTS "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "propertyId" UUID NOT NULL,
    "guestId" UUID NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable payments
CREATE TABLE IF NOT EXISTS "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable reviews
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "guestId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable favorites
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- Índices base
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE INDEX IF NOT EXISTS "properties_hostId_idx" ON "properties"("hostId");
CREATE INDEX IF NOT EXISTS "properties_city_country_idx" ON "properties"("city", "country");
CREATE INDEX IF NOT EXISTS "properties_propertyType_idx" ON "properties"("propertyType");

CREATE INDEX IF NOT EXISTS "bookings_propertyId_idx" ON "bookings"("propertyId");
CREATE INDEX IF NOT EXISTS "bookings_guestId_idx" ON "bookings"("guestId");
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings"("status");
CREATE INDEX IF NOT EXISTS "bookings_propertyId_checkIn_checkOut_idx" ON "bookings"("propertyId", "checkIn", "checkOut");
CREATE INDEX IF NOT EXISTS "bookings_checkIn_checkOut_idx" ON "bookings"("checkIn", "checkOut");

CREATE UNIQUE INDEX IF NOT EXISTS "payments_bookingId_key" ON "payments"("bookingId");
CREATE INDEX IF NOT EXISTS "payments_bookingId_idx" ON "payments"("bookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_bookingId_key" ON "reviews"("bookingId");
CREATE INDEX IF NOT EXISTS "reviews_propertyId_idx" ON "reviews"("propertyId");
CREATE INDEX IF NOT EXISTS "reviews_guestId_idx" ON "reviews"("guestId");

CREATE UNIQUE INDEX IF NOT EXISTS "favorites_userId_propertyId_key" ON "favorites"("userId", "propertyId");
CREATE INDEX IF NOT EXISTS "favorites_userId_idx" ON "favorites"("userId");

-- Foreign keys base
ALTER TABLE "properties" 
  ADD CONSTRAINT "properties_hostId_fkey" 
  FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" 
  ADD CONSTRAINT "bookings_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" 
  ADD CONSTRAINT "bookings_guestId_fkey" 
  FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" 
  ADD CONSTRAINT "payments_bookingId_fkey" 
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" 
  ADD CONSTRAINT "reviews_bookingId_fkey" 
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" 
  ADD CONSTRAINT "reviews_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" 
  ADD CONSTRAINT "reviews_guestId_fkey" 
  FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites" 
  ADD CONSTRAINT "favorites_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites" 
  ADD CONSTRAINT "favorites_propertyId_fkey" 
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 2) Multi-tenant: organizations, subscriptions, organizationId
--    (basado en 20260216100000_add_multi_tenant/migration.sql)
-- ============================================

-- Enums para suscripciones (si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionPlan') THEN
    CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE');
  END IF;
END;
$$;

-- Tabla organizations
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- Tabla subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- organizationId en users / properties / bookings / payments
ALTER TABLE "users"      ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "bookings"   ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "payments"   ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- Organización demo por defecto
INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Demo Organization', 'demo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "organizations" WHERE slug = 'demo');

-- Suscripción demo
INSERT INTO "subscriptions" ("id", "organizationId", "plan", "status", "createdAt", "updatedAt")
SELECT gen_random_uuid(), o.id, 'FREE', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "organizations" o 
WHERE o.slug = 'demo'
  AND NOT EXISTS (SELECT 1 FROM "subscriptions" s WHERE s."organizationId" = o.id);

-- Backfill básico (solo si están en NULL)
UPDATE "users" u
SET "organizationId" = (SELECT id FROM "organizations" WHERE slug = 'demo' LIMIT 1)
WHERE u."organizationId" IS NULL;

UPDATE "properties" p
SET "organizationId" = (SELECT "organizationId" FROM "users" u WHERE u.id = p."hostId" LIMIT 1)
WHERE p."organizationId" IS NULL;

UPDATE "properties" p
SET "organizationId" = (SELECT id FROM "organizations" WHERE slug = 'demo' LIMIT 1)
WHERE p."organizationId" IS NULL;

UPDATE "bookings" b
SET "organizationId" = (SELECT "organizationId" FROM "properties" p WHERE p.id = b."propertyId" LIMIT 1)
WHERE b."organizationId" IS NULL;

UPDATE "payments" pm
SET "organizationId" = (SELECT "organizationId" FROM "bookings" b WHERE b.id = pm."bookingId" LIMIT 1)
WHERE pm."organizationId" IS NULL;

-- Hacer NOT NULL (nuevos datos)
ALTER TABLE "properties" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "bookings"   ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "payments"   ALTER COLUMN "organizationId" SET NOT NULL;

-- Índices multi-tenant
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX IF NOT EXISTS "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");
CREATE INDEX IF NOT EXISTS "users_organizationId_idx" ON "users"("organizationId");
CREATE INDEX IF NOT EXISTS "properties_organizationId_idx" ON "properties"("organizationId");
CREATE INDEX IF NOT EXISTS "bookings_organizationId_idx" ON "bookings"("organizationId");
CREATE INDEX IF NOT EXISTS "payments_organizationId_idx" ON "payments"("organizationId");

-- Foreign keys multi-tenant
ALTER TABLE "subscriptions" 
  ADD CONSTRAINT "subscriptions_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" 
  ADD CONSTRAINT "users_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "properties" 
  ADD CONSTRAINT "properties_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" 
  ADD CONSTRAINT "bookings_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" 
  ADD CONSTRAINT "payments_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 3) Tablas de Experiencias (manual_experiences_tables.sql)
-- ============================================

-- (Se copia el archivo manual_experiences_tables.sql tal cual)
-- Tabla: experiences
CREATE TABLE IF NOT EXISTS "experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerParticipant" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxParticipants" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "hostId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "includes" TEXT NOT NULL,
    "excludes" TEXT,
    "images" TEXT NOT NULL,
    "meetingPoint" TEXT,
    "languages" TEXT,
    "ageRestriction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- Tabla: experience_slots (horarios disponibles)
CREATE TABLE IF NOT EXISTS "experience_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "experienceId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "availableSpots" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "dayOfWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_slots_pkey" PRIMARY KEY ("id")
);

-- Tabla: experience_bookings
CREATE TABLE IF NOT EXISTS "experience_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "experienceId" UUID NOT NULL,
    "guestId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "participants" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_bookings_pkey" PRIMARY KEY ("id")
);

-- Tabla: experience_payments
CREATE TABLE IF NOT EXISTS "experience_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripePaymentIntentId" TEXT UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "platformFeeAmount" DECIMAL(10,2),
    "hostNetAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "experience_payments_bookingId_key" UNIQUE ("bookingId")
);

-- Tabla: experience_reviews
CREATE TABLE IF NOT EXISTS "experience_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "experienceId" UUID NOT NULL,
    "guestId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "experience_reviews_bookingId_key" UNIQUE ("bookingId")
);

-- FOREIGN KEYS experiencias
ALTER TABLE "experiences" 
ADD CONSTRAINT "experiences_hostId_fkey" 
FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experiences" 
ADD CONSTRAINT "experiences_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_slots" 
ADD CONSTRAINT "experience_slots_experienceId_fkey" 
FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_bookings" 
ADD CONSTRAINT "experience_bookings_experienceId_fkey" 
FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_bookings" 
ADD CONSTRAINT "experience_bookings_guestId_fkey" 
FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_bookings" 
ADD CONSTRAINT "experience_bookings_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_payments" 
ADD CONSTRAINT "experience_payments_bookingId_fkey" 
FOREIGN KEY ("bookingId") REFERENCES "experience_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_payments" 
ADD CONSTRAINT "experience_payments_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_reviews" 
ADD CONSTRAINT "experience_reviews_bookingId_fkey" 
FOREIGN KEY ("bookingId") REFERENCES "experience_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_reviews" 
ADD CONSTRAINT "experience_reviews_experienceId_fkey" 
FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_reviews" 
ADD CONSTRAINT "experience_reviews_guestId_fkey" 
FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Índices experiencias
CREATE INDEX IF NOT EXISTS "experiences_hostId_idx" ON "experiences"("hostId");
CREATE INDEX IF NOT EXISTS "experiences_organizationId_idx" ON "experiences"("organizationId");
CREATE INDEX IF NOT EXISTS "experiences_city_country_idx" ON "experiences"("city", "country");
CREATE INDEX IF NOT EXISTS "experiences_category_idx" ON "experiences"("category");
CREATE INDEX IF NOT EXISTS "experiences_status_idx" ON "experiences"("status");

CREATE INDEX IF NOT EXISTS "experience_slots_experienceId_idx" ON "experience_slots"("experienceId");
CREATE INDEX IF NOT EXISTS "experience_slots_date_idx" ON "experience_slots"("date");
CREATE INDEX IF NOT EXISTS "experience_slots_dayOfWeek_idx" ON "experience_slots"("dayOfWeek");

CREATE INDEX IF NOT EXISTS "experience_bookings_experienceId_idx" ON "experience_bookings"("experienceId");
CREATE INDEX IF NOT EXISTS "experience_bookings_guestId_idx" ON "experience_bookings"("guestId");
CREATE INDEX IF NOT EXISTS "experience_bookings_organizationId_idx" ON "experience_bookings"("organizationId");
CREATE INDEX IF NOT EXISTS "experience_bookings_status_idx" ON "experience_bookings"("status");
CREATE INDEX IF NOT EXISTS "experience_bookings_date_idx" ON "experience_bookings"("date");

CREATE INDEX IF NOT EXISTS "experience_payments_bookingId_idx" ON "experience_payments"("bookingId");
CREATE INDEX IF NOT EXISTS "experience_payments_organizationId_idx" ON "experience_payments"("organizationId");

CREATE INDEX IF NOT EXISTS "experience_reviews_experienceId_idx" ON "experience_reviews"("experienceId");
CREATE INDEX IF NOT EXISTS "experience_reviews_guestId_idx" ON "experience_reviews"("guestId");

-- Comentarios (opcional)
COMMENT ON TABLE "experiences" IS 'Experiencias disponibles para reservar';
COMMENT ON TABLE "experience_slots" IS 'Horarios disponibles para cada experiencia';
COMMENT ON TABLE "experience_bookings" IS 'Reservas de experiencias';
COMMENT ON TABLE "experience_payments" IS 'Pagos de reservas de experiencias';
COMMENT ON TABLE "experience_reviews" IS 'Reseñas de experiencias';

-- ============================================
-- 4) Tabla Outbox para el Outbox Pattern
-- ============================================

CREATE TABLE IF NOT EXISTS public.outbox_events (
  id           uuid primary key default gen_random_uuid(),
  aggregate_id text not null,
  type         text not null,
  payload      jsonb not null,
  created_at   timestamptz not null default now(),
  processed_at timestamptz null
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate_id
  ON public.outbox_events (aggregate_id);

CREATE INDEX IF NOT EXISTS idx_outbox_events_type
  ON public.outbox_events (type);
