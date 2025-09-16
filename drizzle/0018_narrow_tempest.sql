CREATE TYPE "public"."payable_category" AS ENUM('rent', 'utilities', 'equipment', 'supplies', 'marketing', 'staff', 'insurance', 'software', 'laboratory', 'shipping', 'maintenance', 'professional_services', 'taxes', 'other');--> statement-breakpoint
CREATE TYPE "public"."payable_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TABLE "payables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"category" "payable_category" NOT NULL,
	"status" "payable_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"supplier_name" text,
	"supplier_document" text,
	"invoice_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payables" ADD CONSTRAINT "payables_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;