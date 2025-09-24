CREATE TYPE "public"."cash_payment_method" AS ENUM('cash', 'pix', 'card', 'other');--> statement-breakpoint
CREATE TYPE "public"."cash_register_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."cash_transaction_type" AS ENUM('sale', 'expense', 'cash_in', 'cash_out', 'change');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'cash_register_opened';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'cash_register_closed';--> statement-breakpoint
CREATE TABLE "cash_register" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"opened_by_user_id" text NOT NULL,
	"closed_by_user_id" text,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"initial_amount_in_cents" integer DEFAULT 0 NOT NULL,
	"final_amount_in_cents" integer,
	"total_sales_in_cents" integer DEFAULT 0 NOT NULL,
	"total_expenses_in_cents" integer DEFAULT 0 NOT NULL,
	"total_cash_in_in_cents" integer DEFAULT 0 NOT NULL,
	"total_cash_out_in_cents" integer DEFAULT 0 NOT NULL,
	"expected_amount_in_cents" integer,
	"difference_in_cents" integer,
	"status" "cash_register_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cash_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cash_register_id" uuid NOT NULL,
	"transaction_id" uuid,
	"type" "cash_transaction_type" NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"description" text NOT NULL,
	"payment_method" "cash_payment_method" NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cash_register" ADD CONSTRAINT "cash_register_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_register" ADD CONSTRAINT "cash_register_opened_by_user_id_users_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_register" ADD CONSTRAINT "cash_register_closed_by_user_id_users_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_cash_register_id_cash_register_id_fk" FOREIGN KEY ("cash_register_id") REFERENCES "public"."cash_register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;