-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'SALES', 'STAFF');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('FACEBOOK', 'ZALO', 'WEBSITE', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CtvStatus" AS ENUM ('AVAILABLE', 'WORKING', 'UNAVAILABLE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('CONSIDERING', 'CV_SENT', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('DAY_SINGLE', 'NIGHT_SINGLE', 'FULLDAY_SINGLE', 'DAY_MONTHLY', 'NIGHT_MONTHLY', 'FULLDAY_MONTHLY', 'BATH_BABY', 'POSTPARTUM', 'TET', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DV1', 'DV2', 'OLD_PRICE', 'NEW_PRICE', 'MOTHER_CARE', 'BATH_BABY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'DEPOSIT_PAID', 'PAID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "display_name" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL DEFAULT 'TPHCM',
    "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctvs" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "national_id" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "hometown" TEXT,
    "years_experience" INTEGER NOT NULL DEFAULT 0,
    "has_certificate" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "avatar_url" TEXT,
    "status" "CtvStatus" NOT NULL DEFAULT 'AVAILABLE',
    "avg_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "referred_by_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ctvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctv_skills" (
    "ctv_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "ctv_skills_pkey" PRIMARY KEY ("ctv_id","skill_id")
);

-- CreateTable
CREATE TABLE "ctv_availabilities" (
    "id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "start_hour" INTEGER NOT NULL,
    "end_hour" INTEGER NOT NULL,

    CONSTRAINT "ctv_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_cases" (
    "id" TEXT NOT NULL,
    "case_code" TEXT,
    "customer_id" TEXT NOT NULL,
    "baby_info" TEXT,
    "case_type" "CaseType" NOT NULL,
    "service_type" "ServiceType" NOT NULL DEFAULT 'DV2',
    "working_hours" TEXT,
    "requirements" TEXT,
    "address" TEXT,
    "area" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "CaseStatus" NOT NULL DEFAULT 'CONSIDERING',
    "sales_id" TEXT,
    "ctv_id" TEXT,
    "ctv_referral_note" TEXT,
    "contract_value" DECIMAL(15,0),
    "service_fee_pre" DECIMAL(15,0),
    "vat_amount" DECIMAL(15,0),
    "ctv_payout" DECIMAL(15,0),
    "ctv_tax" DECIMAL(15,0),
    "profit" DECIMAL(15,0),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paid_at" TIMESTAMP(3),
    "payment_note" TEXT,
    "invoice_file_url" TEXT,
    "contract_file_url" TEXT,
    "ctv_contract_url" TEXT,
    "ctv_annex_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_commissions" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(15,0),
    "type" TEXT NOT NULL DEFAULT 'CASE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_activities" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctv_reviews" (
    "id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ctv_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_salaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "base_salary" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "work_days" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "kpi_target" DECIMAL(15,0),
    "kpi_percentage" DECIMAL(5,2),
    "case_commission" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "ctv_commission" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "meal_allowance" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "total_pay" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_cases_case_code_key" ON "service_cases"("case_code");

-- CreateIndex
CREATE INDEX "service_cases_status_idx" ON "service_cases"("status");

-- CreateIndex
CREATE INDEX "service_cases_start_date_end_date_idx" ON "service_cases"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "service_cases_sales_id_idx" ON "service_cases"("sales_id");

-- CreateIndex
CREATE INDEX "service_cases_ctv_id_idx" ON "service_cases"("ctv_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_commissions_case_id_user_id_type_key" ON "sales_commissions"("case_id", "user_id", "type");

-- CreateIndex
CREATE INDEX "case_activities_case_id_idx" ON "case_activities"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "ctv_reviews_ctv_id_case_id_key" ON "ctv_reviews"("ctv_id", "case_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_salaries_user_id_month_year_key" ON "monthly_salaries"("user_id", "month", "year");

-- AddForeignKey
ALTER TABLE "ctvs" ADD CONSTRAINT "ctvs_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctv_skills" ADD CONSTRAINT "ctv_skills_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "ctvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctv_skills" ADD CONSTRAINT "ctv_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctv_availabilities" ADD CONSTRAINT "ctv_availabilities_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "ctvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "ctvs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_commissions" ADD CONSTRAINT "sales_commissions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "service_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_commissions" ADD CONSTRAINT "sales_commissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_activities" ADD CONSTRAINT "case_activities_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "service_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_activities" ADD CONSTRAINT "case_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctv_reviews" ADD CONSTRAINT "ctv_reviews_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "ctvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctv_reviews" ADD CONSTRAINT "ctv_reviews_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_salaries" ADD CONSTRAINT "monthly_salaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
