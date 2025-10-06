CREATE TYPE "public"."receivable_category" AS ENUM('consultation', 'procedure', 'examination', 'treatment', 'medication', 'equipment_rental', 'professional_service', 'insurance_reimbursement', 'other');--> statement-breakpoint
CREATE TYPE "public"."receivable_status" AS ENUM('pending', 'received', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TABLE "receivables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"category" "receivable_category" NOT NULL,
	"status" "receivable_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp NOT NULL,
	"received_date" timestamp,
	"patient_name" text,
	"patient_document" text,
	"invoice_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "cpf" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "rg" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "birth_date" timestamp;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "crm_number" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "rqe" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "cro" text;--> statement-breakpoint
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;