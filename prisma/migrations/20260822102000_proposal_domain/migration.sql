DO $$ BEGIN
  CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'READY', 'SENT', 'ACCEPTED', 'REJECTED', 'SUPERSEDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Proposal" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "eventDate" TIMESTAMP(3),
  "guestCount" INTEGER NOT NULL DEFAULT 0,
  "serviceType" "ServiceType",
  "venueName" TEXT,
  "serviceChargePct" DECIMAL(5,2) NOT NULL DEFAULT 20,
  "taxPct" DECIMAL(5,2) NOT NULL DEFAULT 13,
  "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProposalItem" (
  "id" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "menuItemId" TEXT,
  "name" TEXT NOT NULL,
  "category" "MenuCategory" NOT NULL DEFAULT 'ENTREE',
  "description" TEXT,
  "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "taxable" BOOLEAN NOT NULL DEFAULT true,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProposalItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Proposal_leadId_version_key" ON "Proposal"("leadId", "version");
CREATE INDEX IF NOT EXISTS "Proposal_leadId_status_idx" ON "Proposal"("leadId", "status");
CREATE INDEX IF NOT EXISTS "ProposalItem_proposalId_idx" ON "ProposalItem"("proposalId");
CREATE INDEX IF NOT EXISTS "ProposalItem_menuItemId_idx" ON "ProposalItem"("menuItemId");

DO $$ BEGIN
  ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_proposalId_fkey"
    FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_menuItemId_fkey"
    FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
