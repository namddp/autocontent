-- AlterTable
ALTER TABLE "ctvs" ADD COLUMN     "area_preference" TEXT,
ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "tax_rate" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "email" TEXT,
ADD COLUMN     "last_case_at" TIMESTAMP(3),
ADD COLUMN     "total_cases" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_spent" DECIMAL(15,0) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "monthly_salaries" ADD COLUMN     "case_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "responsibility_pay" DECIMAL(15,0) NOT NULL DEFAULT 0,
ADD COLUMN     "social_insurance" DECIMAL(15,0) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "service_cases" ADD COLUMN     "commission_rate" DECIMAL(5,2),
ADD COLUMN     "ctv_payment_1_date" TIMESTAMP(3),
ADD COLUMN     "ctv_payment_1_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ctv_payment_2_date" TIMESTAMP(3),
ADD COLUMN     "ctv_payment_2_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deposit_amount" DECIMAL(15,0),
ADD COLUMN     "deposit_date" TIMESTAMP(3),
ADD COLUMN     "has_vat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoice_number" TEXT;

-- CreateTable
CREATE TABLE "case_ctv_assignments" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PRIMARY',
    "payout_amount" DECIMAL(15,0),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_ctv_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_ctv_assignments_ctv_id_idx" ON "case_ctv_assignments"("ctv_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_ctv_assignments_case_id_ctv_id_key" ON "case_ctv_assignments"("case_id", "ctv_id");

-- AddForeignKey
ALTER TABLE "case_ctv_assignments" ADD CONSTRAINT "case_ctv_assignments_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "service_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_ctv_assignments" ADD CONSTRAINT "case_ctv_assignments_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "ctvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
