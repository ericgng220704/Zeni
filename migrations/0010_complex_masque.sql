ALTER TYPE "public"."activity_action" ADD VALUE 'FORECAST_CREATE' BEFORE 'USER_UPDATE';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'FORECAST_ENABLE' BEFORE 'USER_UPDATE';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'PERSONAL_TIPS_CREATE' BEFORE 'USER_UPDATE';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'MESSAGES_CREATE' BEFORE 'USER_UPDATE';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'MESSAGES_DELETE' BEFORE 'USER_UPDATE';