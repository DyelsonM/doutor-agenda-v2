ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('appointment_reminder', 'appointment_cancelled', 'appointment_completed', 'payment_received', 'payment_overdue', 'payable_due', 'payable_overdue', 'system_update', 'backup_completed', 'backup_failed');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";