ALTER TABLE "balances" ADD COLUMN "is_forecasting_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "forecasts" ADD COLUMN "balance_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_tips" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_tips" ADD COLUMN "balance_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_tips" ADD COLUMN "summarized_analysis" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_balance_id_balances_id_fk" FOREIGN KEY ("balance_id") REFERENCES "public"."balances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_tips" ADD CONSTRAINT "personal_tips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_tips" ADD CONSTRAINT "personal_tips_balance_id_balances_id_fk" FOREIGN KEY ("balance_id") REFERENCES "public"."balances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_forecasting_enabled";