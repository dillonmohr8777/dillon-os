CREATE TABLE `evaluation_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`queue_revision` integer NOT NULL,
	`recommendation_count` integer NOT NULL,
	`labeled_choice_count` integer NOT NULL,
	`client_coverage_bps` integer NOT NULL,
	`acceptance_rate_bps` integer NOT NULL,
	`guardrail_pass_rate_bps` integer NOT NULL,
	`stale_source_count` integer NOT NULL,
	`attention_item_count` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evaluation_run_fingerprint_idx` ON `evaluation_runs` (`fingerprint`);--> statement-breakpoint
CREATE TABLE `operator_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`work_item_id` text NOT NULL,
	`work_item_version` integer NOT NULL,
	`queue_revision` integer NOT NULL,
	`request_type` text NOT NULL,
	`requested_action` text NOT NULL,
	`rationale` text,
	`state` text NOT NULL,
	`requested_by` text NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text,
	`resolution_summary` text,
	`safe_result_ref` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operator_request_fingerprint_idx` ON `operator_requests` (`fingerprint`);--> statement-breakpoint
ALTER TABLE `hosted_choices` ADD `created_by` text DEFAULT 'owner' NOT NULL;