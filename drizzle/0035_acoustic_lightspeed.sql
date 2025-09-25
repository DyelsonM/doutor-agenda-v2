CREATE TYPE "public"."payment_frequency" AS ENUM('weekly', 'biweekly', 'monthly', 'quarterly');--> statement-breakpoint
CREATE TYPE "public"."pix_type" AS ENUM('cpf', 'cnpj', 'email', 'phone', 'random_key');--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"trade_name" text,
	"cnpj" text NOT NULL,
	"address" text NOT NULL,
	"responsible_name" text NOT NULL,
	"responsible_phone" text NOT NULL,
	"reception_phone_1" text,
	"reception_phone_2" text,
	"reception_phone_3" text,
	"payment_frequency" "payment_frequency" NOT NULL,
	"pix_key" text NOT NULL,
	"pix_type" "pix_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;