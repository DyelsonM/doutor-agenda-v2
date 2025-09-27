-- Criar apenas as tabelas do sistema de caixa diário
-- Os tipos enum já existem no banco

CREATE TABLE IF NOT EXISTS "cash_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_cash_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"type" "cash_operation_type" NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"description" text NOT NULL,
	"transaction_id" uuid,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_cash" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"opening_time" timestamp NOT NULL,
	"closing_time" timestamp,
	"status" "cash_status" DEFAULT 'open' NOT NULL,
	"opening_amount" integer DEFAULT 0 NOT NULL,
	"closing_amount" integer,
	"expected_amount" integer,
	"difference" integer,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"total_expenses" integer DEFAULT 0 NOT NULL,
	"total_cash_in" integer DEFAULT 0 NOT NULL,
	"total_cash_out" integer DEFAULT 0 NOT NULL,
	"opening_notes" text,
	"closing_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

-- Adicionar foreign keys
ALTER TABLE "cash_operations" ADD CONSTRAINT "cash_operations_daily_cash_id_daily_cash_id_fk" FOREIGN KEY ("daily_cash_id") REFERENCES "public"."daily_cash"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cash_operations" ADD CONSTRAINT "cash_operations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cash_operations" ADD CONSTRAINT "cash_operations_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "daily_cash" ADD CONSTRAINT "daily_cash_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "daily_cash" ADD CONSTRAINT "daily_cash_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
