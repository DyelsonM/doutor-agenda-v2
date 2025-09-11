CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'cash', 'pix', 'bank_transfer', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('appointment_payment', 'subscription_payment', 'refund', 'expense', 'other');--> statement-breakpoint
CREATE TABLE "financial_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"report_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"total_expenses" integer DEFAULT 0 NOT NULL,
	"net_profit" integer DEFAULT 0 NOT NULL,
	"appointment_count" integer DEFAULT 0 NOT NULL,
	"average_appointment_value" integer DEFAULT 0 NOT NULL,
	"report_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"appointment_id" uuid,
	"type" "transaction_type" NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"description" text NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "financial_reports" ADD CONSTRAINT "financial_reports_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;