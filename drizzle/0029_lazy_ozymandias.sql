CREATE TABLE "cash_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cash_register_id" uuid NOT NULL,
	"cash_transaction_id" uuid,
	"cash_entry_id" uuid,
	"cash_exit_id" uuid,
	"type" text NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"payment_method" text NOT NULL,
	"description" text NOT NULL,
	"notes" text,
	"pdf_url" text,
	"pdf_data" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cash_receipts" ADD CONSTRAINT "cash_receipts_cash_register_id_cash_register_id_fk" FOREIGN KEY ("cash_register_id") REFERENCES "public"."cash_register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_receipts" ADD CONSTRAINT "cash_receipts_cash_transaction_id_cash_transactions_id_fk" FOREIGN KEY ("cash_transaction_id") REFERENCES "public"."cash_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_receipts" ADD CONSTRAINT "cash_receipts_cash_entry_id_cash_entries_id_fk" FOREIGN KEY ("cash_entry_id") REFERENCES "public"."cash_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_receipts" ADD CONSTRAINT "cash_receipts_cash_exit_id_cash_exits_id_fk" FOREIGN KEY ("cash_exit_id") REFERENCES "public"."cash_exits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_receipts" ADD CONSTRAINT "cash_receipts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;