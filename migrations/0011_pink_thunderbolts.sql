ALTER TABLE "forecasts" DROP CONSTRAINT "forecasts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "personal_tips" DROP CONSTRAINT "personal_tips_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "forecasts" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "personal_tips" DROP COLUMN "user_id";