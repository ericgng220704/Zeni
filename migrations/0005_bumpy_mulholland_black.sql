CREATE TYPE "public"."activity_action" AS ENUM('BALANCE_CREATE', 'BALANCE_UPDATE', 'BALANCE_DELETE', 'TRANSACTION_CREATE', 'TRANSACTION_UPDATE', 'TRANSACTION_DELETE', 'BUDGET_CREATE', 'BUDGET_UPDATE', 'BUDGET_DELETE', 'RECURRING_TRANSACTION_CREATE', 'RECURRING_TRANSACTION_UPDATE', 'RECURRING_TRANSACTION_DELETE', 'USER_UPDATE', 'INVITATION_SENT', 'CHATBOT_USAGE');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance_id" uuid NOT NULL,
	"action" "activity_action" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_balance_id_balances_id_fk" FOREIGN KEY ("balance_id") REFERENCES "public"."balances"("id") ON DELETE cascade ON UPDATE no action;