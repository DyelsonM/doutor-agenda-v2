ALTER TABLE "gold_client_dependents" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_client_dependents" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_client_dependents" ALTER COLUMN "birth_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_clients" ALTER COLUMN "holder_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_clients" ALTER COLUMN "holder_cpf" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_clients" ALTER COLUMN "holder_phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_clients" ALTER COLUMN "holder_birth_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_clients" ALTER COLUMN "holder_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gold_clients" ALTER COLUMN "holder_zip_code" DROP NOT NULL;