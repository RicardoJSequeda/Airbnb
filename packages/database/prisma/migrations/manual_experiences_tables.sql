-- ============================================
-- MIGRACIÓN MANUAL: Tablas de Experiencias
-- Ejecutar este script directamente en Supabase SQL Editor
-- Tipos TEXT para coincidir con users.id y organizations.id (no UUID nativo)
-- ============================================

-- Tabla: experiences
CREATE TABLE IF NOT EXISTS "experiences" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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
    "hostId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "experienceId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "experienceId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "bookingId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "bookingId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "experience_reviews_bookingId_key" UNIQUE ("bookingId")
);

-- ============================================
-- FOREIGN KEYS (Relaciones)
-- ============================================

-- experiences -> users (host)
ALTER TABLE "experiences" 
ADD CONSTRAINT "experiences_hostId_fkey" 
FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experiences -> organizations
ALTER TABLE "experiences" 
ADD CONSTRAINT "experiences_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_slots -> experiences
ALTER TABLE "experience_slots" 
ADD CONSTRAINT "experience_slots_experienceId_fkey" 
FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_bookings -> experiences
ALTER TABLE "experience_bookings" 
ADD CONSTRAINT "experience_bookings_experienceId_fkey" 
FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_bookings -> users (guest)
ALTER TABLE "experience_bookings" 
ADD CONSTRAINT "experience_bookings_guestId_fkey" 
FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_bookings -> organizations
ALTER TABLE "experience_bookings" 
ADD CONSTRAINT "experience_bookings_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_payments -> experience_bookings
ALTER TABLE "experience_payments" 
ADD CONSTRAINT "experience_payments_bookingId_fkey" 
FOREIGN KEY ("bookingId") REFERENCES "experience_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_payments -> organizations
ALTER TABLE "experience_payments" 
ADD CONSTRAINT "experience_payments_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_reviews -> experience_bookings
ALTER TABLE "experience_reviews" 
ADD CONSTRAINT "experience_reviews_bookingId_fkey" 
FOREIGN KEY ("bookingId") REFERENCES "experience_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_reviews -> experiences
ALTER TABLE "experience_reviews" 
ADD CONSTRAINT "experience_reviews_experienceId_fkey" 
FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- experience_reviews -> users (guest)
ALTER TABLE "experience_reviews" 
ADD CONSTRAINT "experience_reviews_guestId_fkey" 
FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- ÍNDICES (para mejorar performance)
-- ============================================

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

-- ============================================
-- COMENTARIOS (opcional, para documentación)
-- ============================================

COMMENT ON TABLE "experiences" IS 'Experiencias disponibles para reservar';
COMMENT ON TABLE "experience_slots" IS 'Horarios disponibles para cada experiencia';
COMMENT ON TABLE "experience_bookings" IS 'Reservas de experiencias';
COMMENT ON TABLE "experience_payments" IS 'Pagos de reservas de experiencias';
COMMENT ON TABLE "experience_reviews" IS 'Reseñas de experiencias';
