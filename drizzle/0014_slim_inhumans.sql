ALTER TABLE "document_templates" ADD COLUMN "dynamic_fields" text;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "structured_data";