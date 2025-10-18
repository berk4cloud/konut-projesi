CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE "public"."bed_status" AS ENUM('available', 'occupied', 'reserved', 'out_of_service');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('EUR', 'USD', 'TRY', 'GBP', 'CHF', 'CAD', 'MXN', 'CNY', 'JPY', 'RUB', 'SEK', 'NOK', 'DKK', 'HUF', 'PLN', 'CZK', 'RON', 'BGN', 'RSD', 'UAH');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('active', 'inactive', 'former', 'invited');--> statement-breakpoint
CREATE TYPE "public"."gender_restriction" AS ENUM('male', 'female', 'mixed', 'none');--> statement-breakpoint
CREATE TYPE "public"."house_status" AS ENUM('active', 'inactive', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."ownership_type" AS ENUM('rent', 'owned');--> statement-breakpoint
CREATE TYPE "public"."platform_admin_role" AS ENUM('super_admin', 'admin', 'support');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('single', 'double', 'triple', 'quad', 'dormitory');--> statement-breakpoint
CREATE TYPE "public"."tenant_plan" AS ENUM('basic', 'professional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."tenant_role" AS ENUM('owner', 'admin', 'hr_manager', 'planner', 'accommodation_manager', 'transport_manager', 'finance', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('trial', 'active', 'suspended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('direct_employer', 'staffing_agency');--> statement-breakpoint
CREATE TYPE "public"."tenant_user_status" AS ENUM('invited', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."worker_gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."worker_status" AS ENUM('active', 'inactive', 'new_registration', 'checked_out');--> statement-breakpoint
CREATE TABLE "beds" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" varchar NOT NULL,
	"bed_number" integer NOT NULL,
	"status" "bed_status" DEFAULT 'available',
	"last_occupied_by" varchar,
	"last_occupied_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"iso_code" varchar(2) PRIMARY KEY NOT NULL,
	"name_tr" text NOT NULL,
	"name_en" text NOT NULL,
	"name_de" text NOT NULL,
	"name_nl" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_pl" text NOT NULL,
	"name_bg" text NOT NULL,
	"flag_emoji" text,
	"phone_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employment_private_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_id" varchar NOT NULL,
	"salary" numeric,
	"salary_frequency" text,
	"currency" "currency" DEFAULT 'EUR',
	"contract_type" text,
	"contract_start_date" date,
	"contract_end_date" date,
	"internal_notes" text,
	"performance_rating" numeric,
	"manager_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employment_private_data_employment_id_unique" UNIQUE("employment_id")
);
--> statement-breakpoint
CREATE TABLE "employments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_profile_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"status" "employment_status" DEFAULT 'active',
	"start_date" date NOT NULL,
	"end_date" date,
	"snapshot_gender" "worker_gender" NOT NULL,
	"snapshot_photo" text,
	"snapshot_first_name" text NOT NULL,
	"snapshot_last_name" text NOT NULL,
	"job_title" text,
	"department" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"house_number" text,
	"house_number_addition" text,
	"postal_code" text,
	"city" text,
	"country" text,
	"latitude" numeric,
	"longitude" numeric,
	"total_rooms" integer DEFAULT 0,
	"total_beds" integer DEFAULT 0,
	"cost_per_week" numeric,
	"cost_per_bed_per_day" numeric,
	"ownership_type" "ownership_type",
	"status" "house_status" DEFAULT 'active',
	"description" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_admins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" "platform_admin_role" DEFAULT 'admin' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_id" varchar NOT NULL,
	"house_id" varchar NOT NULL,
	"room_id" varchar NOT NULL,
	"bed_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"check_in_date" date,
	"check_out_date" date,
	"status" "reservation_status" DEFAULT 'pending',
	"daily_rate" numeric,
	"total_cost" numeric,
	"on_vacation" boolean DEFAULT false,
	"belongings_in_room" boolean DEFAULT false,
	"description" text,
	"internal_notes" text,
	"confirmed_by" varchar,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" varchar NOT NULL,
	"room_number" text NOT NULL,
	"floor" integer,
	"room_type" "room_type",
	"bed_count" integer DEFAULT 0,
	"gender_restriction" "gender_restriction" DEFAULT 'none',
	"is_family_room" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"cost_per_day" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "tenant_type" DEFAULT 'staffing_agency' NOT NULL,
	"status" "tenant_status" DEFAULT 'trial' NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"plan" "tenant_plan" DEFAULT 'professional' NOT NULL,
	"trial_ends_at" timestamp,
	"subscription_starts_at" timestamp,
	"modules" jsonb DEFAULT '{"workers":true,"planning":false,"accommodation":false,"transport":false,"finance":false}'::jsonb NOT NULL,
	"currency" "currency" DEFAULT 'EUR' NOT NULL,
	"favorite_countries" text[] DEFAULT ARRAY[]::text[],
	"default_country" varchar(2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"email" text PRIMARY KEY NOT NULL,
	"last_tenant_id" varchar,
	"last_selections" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"roles" text[] DEFAULT ARRAY['viewer']::text[] NOT NULL,
	"status" "tenant_user_status" DEFAULT 'invited' NOT NULL,
	"invited_at" timestamp,
	"invited_by" varchar,
	"activated_at" timestamp,
	"invitation_token" text,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_tenant_id_email_unique" UNIQUE("tenant_id","email")
);
--> statement-breakpoint
CREATE TABLE "worker_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"gender" "worker_gender" NOT NULL,
	"phone" text,
	"nationality" text,
	"date_of_birth" date,
	"photo" text,
	"bio" text,
	"address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "worker_profiles_email_unique" UNIQUE("email")
);
