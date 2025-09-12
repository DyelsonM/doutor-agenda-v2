ALTER TABLE "clinics" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "zip_code" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "country" text DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "cnpj" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "crm_number" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "specialties" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "opening_hours" text;