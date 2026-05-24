CREATE TABLE `aesthetic_images` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`image_path` text NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `album_items` (
	`id` text PRIMARY KEY NOT NULL,
	`album_id` text NOT NULL,
	`image_path` text NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`sticker_data` text DEFAULT '[]' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `anniversaries` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`title` text NOT NULL,
	`date` integer NOT NULL,
	`repeat_yearly` integer DEFAULT true NOT NULL,
	`notification_enabled` integer DEFAULT false NOT NULL,
	`notification_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fictional_others` (
	`id` text PRIMARY KEY NOT NULL,
	`persona_id` text NOT NULL,
	`name` text NOT NULL,
	`fandom` text DEFAULT '' NOT NULL,
	`cover_image_path` text,
	`relationship_type` text DEFAULT 'romantic' NOT NULL,
	`nickname` text DEFAULT '' NOT NULL,
	`sharing_preference` text DEFAULT 'ng' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`relationship_start_date` integer,
	`is_pinned` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`persona_id`) REFERENCES `personas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `headcanons` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`content` text NOT NULL,
	`category` text DEFAULT 'random' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `message_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`content` text NOT NULL,
	`is_from_user` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `message_threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outfits` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`title` text NOT NULL,
	`image_path` text,
	`occasion` text DEFAULT 'casual' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `personas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_path` text,
	`description` text DEFAULT '' NOT NULL,
	`pronouns` text DEFAULT '' NOT NULL,
	`accent_color` text DEFAULT 'sakura' NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`song_title` text NOT NULL,
	`artist` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `polycule_members` (
	`polycule_id` text NOT NULL,
	`fo_id` text NOT NULL,
	FOREIGN KEY (`polycule_id`) REFERENCES `polycules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `polycules` (
	`id` text PRIMARY KEY NOT NULL,
	`persona_id` text NOT NULL,
	`name` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`persona_id`) REFERENCES `personas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `storyline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`fo_id` text NOT NULL,
	`emoji` text DEFAULT '♡' NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`date` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`fo_id`) REFERENCES `fictional_others`(`id`) ON UPDATE no action ON DELETE cascade
);
