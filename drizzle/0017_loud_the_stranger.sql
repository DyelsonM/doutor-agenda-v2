ALTER TABLE "patients" ALTER COLUMN "patient_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "patient_type" SET DEFAULT 'particular'::text;--> statement-breakpoint
DROP TYPE "public"."patient_type";--> statement-breakpoint
CREATE TYPE "public"."patient_type" AS ENUM('particular', 'cliente_oro', 'convenio');--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "patient_type" SET DEFAULT 'particular'::"public"."patient_type";--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "patient_type" SET DATA TYPE "public"."patient_type" USING "patient_type"::"public"."patient_type";