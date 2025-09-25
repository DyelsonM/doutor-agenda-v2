CREATE TABLE "gold_client_dependents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gold_client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"birth_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gold_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"holder_name" text NOT NULL,
	"holder_cpf" text NOT NULL,
	"holder_phone" text NOT NULL,
	"holder_birth_date" timestamp NOT NULL,
	"holder_address" text NOT NULL,
	"holder_zip_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "gold_client_dependents" ADD CONSTRAINT "gold_client_dependents_gold_client_id_gold_clients_id_fk" FOREIGN KEY ("gold_client_id") REFERENCES "public"."gold_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold_clients" ADD CONSTRAINT "gold_clients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;