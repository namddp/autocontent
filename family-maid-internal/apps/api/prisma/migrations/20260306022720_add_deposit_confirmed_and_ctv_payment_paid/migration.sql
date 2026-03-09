-- AlterEnum
ALTER TYPE "CaseStatus" ADD VALUE 'DEPOSIT_CONFIRMED';

-- AlterTable
ALTER TABLE "service_cases" ADD COLUMN     "ctv_payment_paid" BOOLEAN NOT NULL DEFAULT false;
