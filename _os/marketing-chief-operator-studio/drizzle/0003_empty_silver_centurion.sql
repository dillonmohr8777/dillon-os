CREATE TABLE `owner_intents` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`client_id` text NOT NULL,
	`client_name` text NOT NULL,
	`queue_revision` integer NOT NULL,
	`title` text NOT NULL,
	`instruction` text NOT NULL,
	`mode` text NOT NULL,
	`priority` text NOT NULL,
	`due_at` text,
	`state` text NOT NULL,
	`requested_by` text NOT NULL,
	`resolved_by` text,
	`created_at` text NOT NULL,
	`resolved_at` text,
	`resolution_summary` text,
	`safe_result_ref` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owner_intent_fingerprint_idx` ON `owner_intents` (`fingerprint`);