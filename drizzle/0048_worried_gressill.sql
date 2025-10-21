ALTER TYPE "public"."payment_method" ADD VALUE 'credit_card' BEFORE 'stripe';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'debit_card' BEFORE 'stripe';