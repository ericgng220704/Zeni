ALTER TABLE "transactions" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category_totals" ADD COLUMN "type" "category_type" NOT NULL;