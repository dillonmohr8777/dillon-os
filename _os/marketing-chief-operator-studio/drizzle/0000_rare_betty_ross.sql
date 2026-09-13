CREATE TABLE `hosted_choices` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text NOT NULL,
	`work_item_version` integer NOT NULL,
	`queue_revision` integer NOT NULL,
	`prediction_lane` text NOT NULL,
	`decision` text NOT NULL,
	`predicted_action` text NOT NULL,
	`replacement_action` text,
	`rationale` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hosted_choice_binding_idx` ON `hosted_choices` (`work_item_id`,`work_item_version`,`prediction_lane`,`predicted_action`);--> statement-breakpoint
CREATE TABLE `studio_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_json` text NOT NULL,
	`queue_revision` integer NOT NULL,
	`generated_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`run_date` text NOT NULL,
	`trigger` text NOT NULL,
	`queue_revision` integer NOT NULL,
	`labeled_choice_count` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `training_run_fingerprint_idx` ON `training_runs` (`fingerprint`);