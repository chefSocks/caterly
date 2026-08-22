ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'QUALIFIED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PROPOSAL';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'DECISION';

ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "preferredContactMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "eventType" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceType" "ServiceType",
  ADD COLUMN IF NOT EXISTS "dateFlexible" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "approximateStartAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "generalLocation" TEXT,
  ADD COLUMN IF NOT EXISTS "venueConfirmed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "venueId" TEXT,
  ADD COLUMN IF NOT EXISTS "nextAction" TEXT,
  ADD COLUMN IF NOT EXISTS "followUpAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lostReason" TEXT;

UPDATE "Lead" SET status = 'PROPOSAL' WHERE status = 'PROPOSAL_SENT';

CREATE TABLE IF NOT EXISTS "LeadActivity" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'NOTE',
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "Lead" ADD CONSTRAINT "Lead_venueId_fkey"
    FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Lead_followUpAt_idx" ON "Lead"("followUpAt");
CREATE INDEX IF NOT EXISTS "Lead_eventDate_idx" ON "Lead"("eventDate");
CREATE INDEX IF NOT EXISTS "Lead_venueId_idx" ON "Lead"("venueId");
CREATE INDEX IF NOT EXISTS "Lead_clientId_idx" ON "Lead"("clientId");
CREATE INDEX IF NOT EXISTS "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");
