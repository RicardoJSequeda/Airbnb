-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE');

-- AlterEnum: Add SUPER_ADMIN to UserRole
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- CreateTable organizations
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
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

-- Add organizationId to users (nullable)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- Add organizationId to properties (nullable first for backfill)
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- Add organizationId to bookings (nullable first for backfill)
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- Add organizationId to payments (nullable first for backfill)
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- Create default demo organization
INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Demo Organization', 'demo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create subscription for demo org
INSERT INTO "subscriptions" ("id", "organizationId", "plan", "status", "createdAt", "updatedAt")
SELECT gen_random_uuid(), o.id, 'FREE', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "organizations" o WHERE o.slug = 'demo';

-- Backfill: assign existing users to demo org
UPDATE "users" u
SET "organizationId" = (SELECT id FROM "organizations" WHERE slug = 'demo' LIMIT 1)
WHERE u."organizationId" IS NULL;

-- Backfill: properties get org from host
UPDATE "properties" p
SET "organizationId" = (SELECT "organizationId" FROM "users" u WHERE u.id = p."hostId" LIMIT 1)
WHERE p."organizationId" IS NULL AND p."hostId" IN (SELECT id FROM "users");

-- If any property has no host with org (edge case), assign demo
UPDATE "properties" p
SET "organizationId" = (SELECT id FROM "organizations" WHERE slug = 'demo' LIMIT 1)
WHERE p."organizationId" IS NULL;

-- Backfill: bookings get org from property
UPDATE "bookings" b
SET "organizationId" = (SELECT "organizationId" FROM "properties" p WHERE p.id = b."propertyId" LIMIT 1)
WHERE b."organizationId" IS NULL;

-- Backfill: payments get org from booking
UPDATE "payments" pm
SET "organizationId" = (SELECT "organizationId" FROM "bookings" b WHERE b.id = pm."bookingId" LIMIT 1)
WHERE pm."organizationId" IS NULL;

-- Make organizationId NOT NULL on properties (for new rows, existing should be filled)
ALTER TABLE "properties" ALTER COLUMN "organizationId" SET NOT NULL;

-- Make organizationId NOT NULL on bookings
ALTER TABLE "bookings" ALTER COLUMN "organizationId" SET NOT NULL;

-- Make organizationId NOT NULL on payments
ALTER TABLE "payments" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");
CREATE INDEX "properties_organizationId_idx" ON "properties"("organizationId");
CREATE INDEX "bookings_organizationId_idx" ON "bookings"("organizationId");
CREATE INDEX "payments_organizationId_idx" ON "payments"("organizationId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "properties" ADD CONSTRAINT "properties_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
