CREATE TYPE "public"."forecast_period_type" AS ENUM('WEEK', 'MONTH');--> statement-breakpoint
CREATE TABLE "forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period_type" "forecast_period_type" NOT NULL,
	"forecast_start" timestamp NOT NULL,
	"forecast_end" timestamp NOT NULL,
	"forecast_income" numeric DEFAULT '0' NOT NULL,
	"forecast_expense" numeric DEFAULT '0' NOT NULL,
	"forecast_net" numeric DEFAULT '0' NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_tips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"forecast_id" uuid NOT NULL,
	"tips_json" text,
	"detailed_analysis" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_forecasting_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "personal_tips" ADD CONSTRAINT "personal_tips_forecast_id_forecasts_id_fk" FOREIGN KEY ("forecast_id") REFERENCES "public"."forecasts"("id") ON DELETE cascade ON UPDATE no action;