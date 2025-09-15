CREATE TYPE "public"."patient_type" AS ENUM('particular', 'cliente_ouro', 'convenio');--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_template_id_document_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "patient_type" "patient_type" DEFAULT 'particular' NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "insurance_name" text;--> statement-breakpoint
ALTER TABLE "document_templates" DROP COLUMN "fields";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "template_id";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "field_data";