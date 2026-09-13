ALTER TABLE `hosted_choices` ADD `state` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `hosted_choices` ADD `resolved_at` text;--> statement-breakpoint
ALTER TABLE `hosted_choices` ADD `resolved_by` text;--> statement-breakpoint
ALTER TABLE `hosted_choices` ADD `canonical_outcome_id` text;