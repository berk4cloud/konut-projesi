--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_email_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_tenant_id_email_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_slug_unique;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS rooms_pkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.qr_codes DROP CONSTRAINT IF EXISTS qr_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.qr_codes DROP CONSTRAINT IF EXISTS qr_codes_code_unique;
ALTER TABLE IF EXISTS ONLY public.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_pkey;
ALTER TABLE IF EXISTS ONLY public.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_email_unique;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.houses DROP CONSTRAINT IF EXISTS houses_pkey;
ALTER TABLE IF EXISTS ONLY public.employments DROP CONSTRAINT IF EXISTS employments_pkey;
ALTER TABLE IF EXISTS ONLY public.employment_private_data DROP CONSTRAINT IF EXISTS employment_private_data_pkey;
ALTER TABLE IF EXISTS ONLY public.employment_private_data DROP CONSTRAINT IF EXISTS employment_private_data_employment_id_unique;
ALTER TABLE IF EXISTS ONLY public.countries DROP CONSTRAINT IF EXISTS countries_pkey;
ALTER TABLE IF EXISTS ONLY public.charges DROP CONSTRAINT IF EXISTS charges_pkey;
ALTER TABLE IF EXISTS ONLY public.beds DROP CONSTRAINT IF EXISTS beds_pkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.assignment_notes DROP CONSTRAINT IF EXISTS assignment_notes_pkey;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.worker_profiles;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_preferences;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.rooms;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.qr_codes;
DROP TABLE IF EXISTS public.platform_admins;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.houses;
DROP TABLE IF EXISTS public.employments;
DROP TABLE IF EXISTS public.employment_private_data;
DROP TABLE IF EXISTS public.countries;
DROP TABLE IF EXISTS public.charges;
DROP TABLE IF EXISTS public.beds;
DROP TABLE IF EXISTS public.assignments;
DROP TABLE IF EXISTS public.assignment_notes;
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP TYPE IF EXISTS public.worker_status;
DROP TYPE IF EXISTS public.worker_gender;
DROP TYPE IF EXISTS public.tenant_user_status;
DROP TYPE IF EXISTS public.tenant_type;
DROP TYPE IF EXISTS public.tenant_status;
DROP TYPE IF EXISTS public.tenant_role;
DROP TYPE IF EXISTS public.tenant_plan;
DROP TYPE IF EXISTS public.room_type;
DROP TYPE IF EXISTS public.reservation_status;
DROP TYPE IF EXISTS public.qr_code_type;
DROP TYPE IF EXISTS public.qr_code_status;
DROP TYPE IF EXISTS public.platform_admin_role;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method;
DROP TYPE IF EXISTS public.ownership_type;
DROP TYPE IF EXISTS public.house_status;
DROP TYPE IF EXISTS public.gender_restriction;
DROP TYPE IF EXISTS public.employment_status;
DROP TYPE IF EXISTS public.deposit_status;
DROP TYPE IF EXISTS public.currency;
DROP TYPE IF EXISTS public.charge_calculation_type;
DROP TYPE IF EXISTS public.bed_status;
DROP TYPE IF EXISTS public.assignment_status;
DROP EXTENSION IF EXISTS pgcrypto;
-- *not* dropping schema, since initdb creates it
DROP SCHEMA IF EXISTS drizzle;
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: assignment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.assignment_status AS ENUM (
    'active',
    'ending_soon',
    'ended'
);


--
-- Name: bed_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bed_status AS ENUM (
    'available',
    'occupied',
    'reserved',
    'out_of_service'
);


--
-- Name: charge_calculation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.charge_calculation_type AS ENUM (
    'full_month',
    'partial',
    'prorated'
);


--
-- Name: currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.currency AS ENUM (
    'EUR',
    'USD',
    'TRY',
    'GBP',
    'CHF',
    'CAD',
    'MXN',
    'CNY',
    'JPY',
    'RUB',
    'SEK',
    'NOK',
    'DKK',
    'HUF',
    'PLN',
    'CZK',
    'RON',
    'BGN',
    'RSD',
    'UAH'
);


--
-- Name: deposit_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.deposit_status AS ENUM (
    'pending',
    'collected',
    'refunded',
    'partially_refunded'
);


--
-- Name: employment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employment_status AS ENUM (
    'active',
    'inactive',
    'former',
    'invited'
);


--
-- Name: gender_restriction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_restriction AS ENUM (
    'male',
    'female',
    'mixed',
    'none'
);


--
-- Name: house_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.house_status AS ENUM (
    'active',
    'inactive',
    'maintenance'
);


--
-- Name: ownership_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ownership_type AS ENUM (
    'rent',
    'owned'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'bank_transfer',
    'pos',
    'other'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'partial',
    'paid',
    'overdue'
);


--
-- Name: platform_admin_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.platform_admin_role AS ENUM (
    'super_admin',
    'admin',
    'support'
);


--
-- Name: qr_code_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.qr_code_status AS ENUM (
    'active',
    'disabled',
    'expired'
);


--
-- Name: qr_code_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.qr_code_type AS ENUM (
    'worker_registration',
    'meter_reading',
    'document_upload'
);


--
-- Name: reservation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reservation_status AS ENUM (
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled'
);


--
-- Name: room_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.room_type AS ENUM (
    'single',
    'double',
    'triple',
    'quad',
    'dormitory'
);


--
-- Name: tenant_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_plan AS ENUM (
    'basic',
    'professional',
    'enterprise'
);


--
-- Name: tenant_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_role AS ENUM (
    'owner',
    'admin',
    'hr_manager',
    'planner',
    'accommodation_manager',
    'transport_manager',
    'finance',
    'viewer'
);


--
-- Name: tenant_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_status AS ENUM (
    'trial',
    'active',
    'suspended',
    'cancelled'
);


--
-- Name: tenant_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_type AS ENUM (
    'direct_employer',
    'staffing_agency'
);


--
-- Name: tenant_user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_user_status AS ENUM (
    'invited',
    'active',
    'inactive'
);


--
-- Name: worker_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.worker_gender AS ENUM (
    'male',
    'female'
);


--
-- Name: worker_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.worker_status AS ENUM (
    'active',
    'inactive',
    'new_registration',
    'checked_out'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: assignment_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment_notes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    assignment_id character varying NOT NULL,
    note text NOT NULL,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    employment_id character varying NOT NULL,
    house_id character varying NOT NULL,
    room_id character varying NOT NULL,
    bed_id character varying NOT NULL,
    start_date date NOT NULL,
    end_date date,
    monthly_rate numeric NOT NULL,
    status public.assignment_status DEFAULT 'active'::public.assignment_status NOT NULL,
    deposit_collected boolean DEFAULT false NOT NULL,
    deposit_amount numeric DEFAULT '0'::numeric,
    deposit_date date,
    deposit_collector character varying,
    deposit_status public.deposit_status DEFAULT 'pending'::public.deposit_status NOT NULL,
    deposit_refund_date date,
    deposit_refund_amount numeric,
    damage_amount numeric,
    damage_note text,
    agreement_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying
);


--
-- Name: beds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beds (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    room_id character varying NOT NULL,
    bed_number integer NOT NULL,
    status public.bed_status DEFAULT 'available'::public.bed_status,
    last_occupied_by character varying,
    last_occupied_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: charges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.charges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    assignment_id character varying NOT NULL,
    month character varying(7) NOT NULL,
    amount numeric NOT NULL,
    expected_amount numeric NOT NULL,
    remaining_amount numeric NOT NULL,
    days integer NOT NULL,
    calculation_type public.charge_calculation_type NOT NULL,
    due_date date NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    iso_code character varying(2) NOT NULL,
    name_tr text NOT NULL,
    name_en text NOT NULL,
    name_de text NOT NULL,
    name_nl text NOT NULL,
    name_fr text NOT NULL,
    name_pl text NOT NULL,
    name_bg text NOT NULL,
    flag_emoji text,
    phone_code text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: employment_private_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employment_private_data (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    employment_id character varying NOT NULL,
    salary numeric,
    salary_frequency text,
    currency public.currency DEFAULT 'EUR'::public.currency,
    contract_type text,
    contract_start_date date,
    contract_end_date date,
    internal_notes text,
    performance_rating numeric,
    manager_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: employments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    worker_profile_id character varying NOT NULL,
    tenant_id character varying NOT NULL,
    status public.employment_status DEFAULT 'active'::public.employment_status,
    start_date date NOT NULL,
    end_date date,
    snapshot_gender public.worker_gender NOT NULL,
    snapshot_photo text,
    snapshot_first_name text NOT NULL,
    snapshot_last_name text NOT NULL,
    job_title text,
    department text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying
);


--
-- Name: houses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.houses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    name text NOT NULL,
    address text,
    house_number text,
    house_number_addition text,
    postal_code text,
    city text,
    country text,
    latitude numeric,
    longitude numeric,
    total_rooms integer DEFAULT 0,
    total_beds integer DEFAULT 0,
    cost_per_week numeric,
    cost_per_bed_per_day numeric,
    ownership_type public.ownership_type,
    status public.house_status DEFAULT 'active'::public.house_status,
    description text,
    internal_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    charge_id character varying NOT NULL,
    amount numeric NOT NULL,
    payment_date date NOT NULL,
    payment_method public.payment_method NOT NULL,
    collector_name character varying,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    reference character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by character varying
);


--
-- Name: platform_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_admins (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role public.platform_admin_role DEFAULT 'admin'::public.platform_admin_role NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: qr_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_codes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    type public.qr_code_type NOT NULL,
    code character varying(20) NOT NULL,
    title text NOT NULL,
    status public.qr_code_status DEFAULT 'active'::public.qr_code_status NOT NULL,
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    expiry_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by character varying
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    employment_id character varying NOT NULL,
    house_id character varying NOT NULL,
    room_id character varying NOT NULL,
    bed_id character varying NOT NULL,
    tenant_id character varying NOT NULL,
    start_date date NOT NULL,
    end_date date,
    check_in_date date,
    check_out_date date,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status,
    daily_rate numeric,
    total_cost numeric,
    on_vacation boolean DEFAULT false,
    belongings_in_room boolean DEFAULT false,
    description text,
    internal_notes text,
    confirmed_by character varying,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying,
    notes text[] DEFAULT ARRAY[]::text[]
);


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    house_id character varying NOT NULL,
    room_number text NOT NULL,
    floor integer,
    room_type public.room_type,
    bed_count integer DEFAULT 0,
    gender_restriction public.gender_restriction DEFAULT 'none'::public.gender_restriction,
    is_family_room boolean DEFAULT false,
    status text DEFAULT 'active'::text,
    cost_per_day numeric,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type public.tenant_type DEFAULT 'staffing_agency'::public.tenant_type NOT NULL,
    status public.tenant_status DEFAULT 'trial'::public.tenant_status NOT NULL,
    contact_email text,
    contact_phone text,
    plan public.tenant_plan DEFAULT 'professional'::public.tenant_plan NOT NULL,
    trial_ends_at timestamp without time zone,
    subscription_starts_at timestamp without time zone,
    modules jsonb DEFAULT '{"finance": false, "workers": true, "planning": false, "transport": false, "accommodation": false}'::jsonb NOT NULL,
    currency public.currency DEFAULT 'EUR'::public.currency NOT NULL,
    favorite_countries text[] DEFAULT ARRAY[]::text[],
    default_country character varying(2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying,
    pricing_settings jsonb DEFAULT '{"standardPricing": {"bedDailyPrice": 25, "roomDailyPrice": 70, "bedMonthlyPrice": 600, "roomMonthlyPrice": 1700}, "dailyRentalEnabled": false}'::jsonb NOT NULL,
    timezone text DEFAULT 'UTC'::text NOT NULL
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    email text NOT NULL,
    last_tenant_id character varying,
    last_selections jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    email text NOT NULL,
    password text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    roles text[] DEFAULT ARRAY['viewer'::text] NOT NULL,
    status public.tenant_user_status DEFAULT 'invited'::public.tenant_user_status NOT NULL,
    invited_at timestamp without time zone,
    invited_by character varying,
    activated_at timestamp without time zone,
    invitation_token text,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: worker_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    gender public.worker_gender NOT NULL,
    phone text,
    nationality text,
    date_of_birth date,
    photo text,
    bio text,
    address text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: assignment_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignment_notes (id, tenant_id, assignment_id, note, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignments (id, tenant_id, employment_id, house_id, room_id, bed_id, start_date, end_date, monthly_rate, status, deposit_collected, deposit_amount, deposit_date, deposit_collector, deposit_status, deposit_refund_date, deposit_refund_amount, damage_amount, damage_note, agreement_notes, created_at, updated_at, created_by) FROM stdin;
59f4c7fb-07cb-443b-9692-9f7a2e211d21	tenant-cova	emp-1	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	2025-10-19	\N	750	active	t	600	\N	jan@cova.nl	collected	\N	\N	\N	\N	\N	2025-10-19 07:25:27.992776	2025-10-19 07:25:27.992776	\N
3ce57df3-0aa2-40b2-bffc-c99d6a95a46d	tenant-cova	emp-6	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	bc519f6c-bb39-4632-9105-ed8cbc35b474	01f7fb95-492a-4444-92a8-d13d7f6a5201	2025-09-30	2025-12-30	600	active	f	500	\N	jan@cova.nl	pending	\N	\N	\N	\N	\N	2025-10-19 13:15:45.330247	2025-10-19 13:15:45.330247	\N
44fa28e0-73fe-4840-8154-2e3c06b9de3a	tenant-cova	emp-1	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	2025-09-30	\N	600	active	f	500	\N	jan@cova.nl	pending	\N	\N	\N	\N	\N	2025-10-19 16:08:32.157123	2025-10-19 16:08:32.157123	\N
751a4f41-a7b5-4b02-87c6-78c74887e1c7	tenant-cova	emp-2	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	7af1b228-b8b0-4227-85fe-a29adb44dc1e	d81b3b55-ed48-40d4-84be-2225d7037dd9	2025-10-01	\N	600	active	f	500	\N	jan@cova.nl	pending	\N	\N	\N	\N	\N	2025-10-19 16:13:59.338512	2025-10-19 16:13:59.338512	\N
00295ebd-53fe-45b8-98d8-cb52635951d2	tenant-cova	emp-2	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	2025-10-01	\N	600	active	f	500	\N	jan@cova.nl	pending	\N	\N	\N	\N	\N	2025-10-19 17:10:20.629468	2025-10-19 17:10:20.629468	\N
69a1f5ed-9746-4ca5-9764-0d243048352d	tenant-cova	emp-1	5f0a4e94-3b68-4b84-8b78-56ac0ce92346	bb8c99bd-210e-4a7e-8813-3f7214142fd4	c0abcaa1-7768-4040-a62e-a53f31fd9f51	2025-10-19	\N	600	active	f	500	\N	jan@cova.nl	pending	\N	\N	\N	\N	\N	2025-10-19 17:36:47.550912	2025-10-19 17:36:47.550912	\N
\.


--
-- Data for Name: beds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beds (id, room_id, bed_number, status, last_occupied_by, last_occupied_at, created_at, updated_at) FROM stdin;
ba506bb3-602c-44a7-a152-16055c2a5c21	9f78363d-3994-48e7-8a4f-5c412e5d35aa	1	available	\N	\N	2025-10-19 04:15:09.586359	2025-10-19 04:15:09.586359
0c37e7b5-2723-4899-88b7-62005a01f1f6	9f78363d-3994-48e7-8a4f-5c412e5d35aa	2	available	\N	\N	2025-10-19 04:15:09.637982	2025-10-19 04:15:09.637982
39a92317-aded-4621-8ff8-7c2e4982007e	fbd8805b-c9a9-463f-a7d9-6a643c24be54	1	available	\N	\N	2025-10-19 04:15:09.7144	2025-10-19 04:15:09.7144
1d84daf1-f051-4a41-a1b7-92bcb822962b	fbd8805b-c9a9-463f-a7d9-6a643c24be54	2	available	\N	\N	2025-10-19 04:15:09.752584	2025-10-19 04:15:09.752584
60509665-59a5-4d20-a2d4-c4e4ef6af418	fbd8805b-c9a9-463f-a7d9-6a643c24be54	3	available	\N	\N	2025-10-19 04:15:09.791192	2025-10-19 04:15:09.791192
a96548f4-1d4a-4546-a119-531cd1e26cda	fbd8805b-c9a9-463f-a7d9-6a643c24be54	4	available	\N	\N	2025-10-19 04:15:09.829249	2025-10-19 04:15:09.829249
9b87b59d-682f-4019-abac-78b0d0cd17a2	fbd8805b-c9a9-463f-a7d9-6a643c24be54	5	available	\N	\N	2025-10-19 04:15:09.867348	2025-10-19 04:15:09.867348
e75d7515-6a5f-487d-a36b-a5c19d266d25	fbd8805b-c9a9-463f-a7d9-6a643c24be54	6	available	\N	\N	2025-10-19 04:15:09.905732	2025-10-19 04:15:09.905732
a5b28829-c7e5-4fa2-8a30-ad554e3a38cc	1e87d8c8-7682-4dd9-8215-35161a717d2d	1	available	\N	\N	2025-10-19 04:15:09.982511	2025-10-19 04:15:09.982511
67c42cf8-6955-430b-acf0-41da3aac3de1	1e87d8c8-7682-4dd9-8215-35161a717d2d	2	available	\N	\N	2025-10-19 04:15:10.020525	2025-10-19 04:15:10.020525
212934b4-fa64-47fe-af16-32b49fb21596	29396337-2a9d-4dba-8c97-5a8f21a6a905	1	available	\N	\N	2025-10-19 04:15:10.096822	2025-10-19 04:15:10.096822
366cda50-7426-4d4f-8736-214b49c5ac22	29396337-2a9d-4dba-8c97-5a8f21a6a905	2	available	\N	\N	2025-10-19 04:15:10.133905	2025-10-19 04:15:10.133905
a1f5faed-04b7-4171-8c2c-cb40b076b9a4	29396337-2a9d-4dba-8c97-5a8f21a6a905	3	available	\N	\N	2025-10-19 04:15:10.172341	2025-10-19 04:15:10.172341
ae03c385-02ae-4114-aa31-acc4c976927e	29396337-2a9d-4dba-8c97-5a8f21a6a905	4	available	\N	\N	2025-10-19 04:15:10.210879	2025-10-19 04:15:10.210879
320c2a9e-b7ce-4e0b-a5b2-d6c3d9ae5f75	29396337-2a9d-4dba-8c97-5a8f21a6a905	5	available	\N	\N	2025-10-19 04:15:10.249306	2025-10-19 04:15:10.249306
26159c4b-46cc-4fa3-abb3-98269e5fa559	7a67d399-2033-4571-bf8f-9629686e2fc6	1	available	\N	\N	2025-10-19 04:15:10.506853	2025-10-19 04:15:10.506853
d8422543-a1f2-430d-bf59-1124e1ae00d7	7a67d399-2033-4571-bf8f-9629686e2fc6	2	available	\N	\N	2025-10-19 04:15:10.546529	2025-10-19 04:15:10.546529
0680176a-6ddc-4056-bdc7-2da874e7ea8f	638db7fb-5b98-4d76-b2b3-32ed00e613f3	1	available	\N	\N	2025-10-19 04:15:10.624965	2025-10-19 04:15:10.624965
b960c6d2-938f-4e9d-ae4a-497e4ee1c86c	638db7fb-5b98-4d76-b2b3-32ed00e613f3	2	available	\N	\N	2025-10-19 04:15:10.662959	2025-10-19 04:15:10.662959
96e30139-08dd-4e9f-a2f3-41d6e6450105	638db7fb-5b98-4d76-b2b3-32ed00e613f3	3	available	\N	\N	2025-10-19 04:15:10.700907	2025-10-19 04:15:10.700907
df963490-4bdd-4c01-824b-3d3207c2fb9a	638db7fb-5b98-4d76-b2b3-32ed00e613f3	4	available	\N	\N	2025-10-19 04:15:10.738891	2025-10-19 04:15:10.738891
4ff12465-0db1-4dac-8f52-472a49b0a9c6	638db7fb-5b98-4d76-b2b3-32ed00e613f3	5	available	\N	\N	2025-10-19 04:15:10.776815	2025-10-19 04:15:10.776815
773625be-777f-4092-a914-0e0a234c8141	638db7fb-5b98-4d76-b2b3-32ed00e613f3	6	available	\N	\N	2025-10-19 04:15:10.81468	2025-10-19 04:15:10.81468
6036482f-56ce-4b8e-9cd9-dcc9cd172d77	e1853f71-8baf-461f-8af6-3524097c027a	1	available	\N	\N	2025-10-19 04:15:10.861681	2025-10-19 04:15:10.861681
0588f6ba-b067-446c-97de-8d2010e84975	38294ac9-d36d-42f4-9442-92d9afb530fa	1	available	\N	\N	2025-10-19 04:15:10.891755	2025-10-19 04:15:10.891755
186cc4b1-34ab-4795-bdf2-60c169f8809f	e1853f71-8baf-461f-8af6-3524097c027a	2	available	\N	\N	2025-10-19 04:15:10.901082	2025-10-19 04:15:10.901082
647b741c-ecae-4747-b9d6-91a40f6f0560	38294ac9-d36d-42f4-9442-92d9afb530fa	2	available	\N	\N	2025-10-19 04:15:10.930172	2025-10-19 04:15:10.930172
404c7ecc-c456-4c1b-b2b7-c50707cc8733	5068dd24-316c-4aa4-844e-0f5f4dfd62ba	1	available	\N	\N	2025-10-19 04:15:10.976454	2025-10-19 04:15:10.976454
bec2bad0-589b-4028-b737-f466ab0f28f7	8dd799da-21e9-4b80-8e1a-e0c8c885329c	1	available	\N	\N	2025-10-19 04:15:11.006682	2025-10-19 04:15:11.006682
3480ccee-8b5a-42c4-8b09-a54fc7d99e97	5068dd24-316c-4aa4-844e-0f5f4dfd62ba	2	available	\N	\N	2025-10-19 04:15:11.014207	2025-10-19 04:15:11.014207
4b17f71a-a8b1-4632-a43e-26d87def450d	8dd799da-21e9-4b80-8e1a-e0c8c885329c	2	available	\N	\N	2025-10-19 04:15:11.044502	2025-10-19 04:15:11.044502
fec3cc30-be6a-434f-a638-ae3074d5ed02	5068dd24-316c-4aa4-844e-0f5f4dfd62ba	3	available	\N	\N	2025-10-19 04:15:11.051876	2025-10-19 04:15:11.051876
38861185-179d-4e7c-b319-5aa22736ff75	aec13621-b762-41fa-afcc-ff1920000704	1	available	\N	\N	2025-10-19 04:15:11.056332	2025-10-19 04:15:11.056332
24cf7e14-3bcd-4fee-b404-1594dc718e97	8dd799da-21e9-4b80-8e1a-e0c8c885329c	3	available	\N	\N	2025-10-19 04:15:11.082408	2025-10-19 04:15:11.082408
3fe343f7-a973-48aa-aea9-b036bb537e39	5068dd24-316c-4aa4-844e-0f5f4dfd62ba	4	available	\N	\N	2025-10-19 04:15:11.08997	2025-10-19 04:15:11.08997
49d0e89d-c6f9-45f9-995f-483711ac4cb2	aec13621-b762-41fa-afcc-ff1920000704	2	available	\N	\N	2025-10-19 04:15:11.095482	2025-10-19 04:15:11.095482
7cdc0acd-d594-498d-a57f-669722940a3e	8dd799da-21e9-4b80-8e1a-e0c8c885329c	4	available	\N	\N	2025-10-19 04:15:11.120083	2025-10-19 04:15:11.120083
cfa314fe-7cfe-44fa-bee9-5bee47a6a117	5068dd24-316c-4aa4-844e-0f5f4dfd62ba	5	available	\N	\N	2025-10-19 04:15:11.127393	2025-10-19 04:15:11.127393
1406759c-304b-43a6-9f21-d0fc92e3b53b	8dd799da-21e9-4b80-8e1a-e0c8c885329c	5	available	\N	\N	2025-10-19 04:15:11.157869	2025-10-19 04:15:11.157869
b7e5a0b6-51c4-4168-9899-66cf22963cd3	5068dd24-316c-4aa4-844e-0f5f4dfd62ba	6	available	\N	\N	2025-10-19 04:15:11.16545	2025-10-19 04:15:11.16545
0a5366fc-feb4-4fbe-929f-a91041c3925a	9b806869-1673-4cd2-ada0-b99ed08beb2a	1	available	\N	\N	2025-10-19 04:15:11.170652	2025-10-19 04:15:11.170652
e8183a26-dc00-49ad-838c-1914f5f97fa4	9b806869-1673-4cd2-ada0-b99ed08beb2a	2	available	\N	\N	2025-10-19 04:15:11.208527	2025-10-19 04:15:11.208527
57cb8719-ad4d-46cf-818c-d756125729c6	7db25105-f6be-46f4-a456-c8c582eca76d	1	available	\N	\N	2025-10-19 04:15:11.246451	2025-10-19 04:15:11.246451
e517fefd-b16a-489d-ad0d-db8f64162d6e	9e048491-46e8-45e5-b5a0-4fcf1ab9d64d	1	available	\N	\N	2025-10-19 04:15:11.246084	2025-10-19 04:15:11.246084
0ba3a867-e0f0-4e41-812d-e06b1031f299	9b806869-1673-4cd2-ada0-b99ed08beb2a	3	available	\N	\N	2025-10-19 04:15:11.250146	2025-10-19 04:15:11.250146
a20f2512-415f-4d1a-9da4-2c6408bae40d	9e048491-46e8-45e5-b5a0-4fcf1ab9d64d	2	available	\N	\N	2025-10-19 04:15:11.28615	2025-10-19 04:15:11.28615
9de0d80f-be83-4c49-aac2-c0f63e31f934	7db25105-f6be-46f4-a456-c8c582eca76d	2	available	\N	\N	2025-10-19 04:15:11.286504	2025-10-19 04:15:11.286504
8c345d20-ce32-443b-a38c-d6969ac85635	9b806869-1673-4cd2-ada0-b99ed08beb2a	4	available	\N	\N	2025-10-19 04:15:11.290536	2025-10-19 04:15:11.290536
ff17a9e4-efef-4c7e-8027-fbeb63e5a805	9b806869-1673-4cd2-ada0-b99ed08beb2a	5	available	\N	\N	2025-10-19 04:15:11.329469	2025-10-19 04:15:11.329469
a4a8d1fa-e43a-4f26-8c15-aa4d2cbf9f23	70c690a7-8caf-4f0b-8046-ce27a15b2ab3	1	available	\N	\N	2025-10-19 04:15:11.360896	2025-10-19 04:15:11.360896
e64838ef-dc1e-4381-a882-3552f4dfc52a	a0fe6564-10fd-45f1-afe7-98979cbd0c4a	1	available	\N	\N	2025-10-19 04:15:11.363712	2025-10-19 04:15:11.363712
343b3646-ecc7-43eb-b538-6a11b8453a4e	9b806869-1673-4cd2-ada0-b99ed08beb2a	6	available	\N	\N	2025-10-19 04:15:11.367044	2025-10-19 04:15:11.367044
2e0072fc-c169-4045-a94c-bf221c7ed4d2	70c690a7-8caf-4f0b-8046-ce27a15b2ab3	2	available	\N	\N	2025-10-19 04:15:11.398786	2025-10-19 04:15:11.398786
1db10795-20f5-4daa-8663-1083e0a0d50a	a0fe6564-10fd-45f1-afe7-98979cbd0c4a	2	available	\N	\N	2025-10-19 04:15:11.40119	2025-10-19 04:15:11.40119
b1dc35b2-bd7b-4efb-90f8-a5bec552a0f8	70c690a7-8caf-4f0b-8046-ce27a15b2ab3	3	available	\N	\N	2025-10-19 04:15:11.438176	2025-10-19 04:15:11.438176
ab1f5657-876a-4590-a0e2-0cce08a6cd92	a0fe6564-10fd-45f1-afe7-98979cbd0c4a	3	available	\N	\N	2025-10-19 04:15:11.443051	2025-10-19 04:15:11.443051
bf2599fc-59c3-4142-a8d9-a17b3f9020f6	c3ce8c2f-9f7e-4e68-9492-46ee4ecf45af	1	available	\N	\N	2025-10-19 04:15:11.477793	2025-10-19 04:15:11.477793
7138eec5-d4dc-4502-8ab1-a19477d35ece	70c690a7-8caf-4f0b-8046-ce27a15b2ab3	4	available	\N	\N	2025-10-19 04:15:11.533759	2025-10-19 04:15:11.533759
9696f3fa-4610-443d-a35d-2ac76de7bfdc	a0fe6564-10fd-45f1-afe7-98979cbd0c4a	4	available	\N	\N	2025-10-19 04:15:11.55575	2025-10-19 04:15:11.55575
552645d8-2f22-4184-92a0-fd000e46cb3c	c3ce8c2f-9f7e-4e68-9492-46ee4ecf45af	2	available	\N	\N	2025-10-19 04:15:11.598028	2025-10-19 04:15:11.598028
8ae1956d-cdfd-4b29-a00a-50edabf67bd6	70c690a7-8caf-4f0b-8046-ce27a15b2ab3	5	available	\N	\N	2025-10-19 04:15:11.721586	2025-10-19 04:15:11.721586
ce449d55-16b7-472a-a4ec-69a3952c79e2	a0fe6564-10fd-45f1-afe7-98979cbd0c4a	5	available	\N	\N	2025-10-19 04:15:11.721969	2025-10-19 04:15:11.721969
7565f2a9-04c6-4e28-ab2e-51b39b4d870a	70c690a7-8caf-4f0b-8046-ce27a15b2ab3	6	available	\N	\N	2025-10-19 04:15:11.759864	2025-10-19 04:15:11.759864
936295d1-5e29-4f42-9395-edb5a61d17df	1912443e-0ded-46d7-bb6a-90b4a1073574	1	available	\N	\N	2025-10-19 04:15:11.871034	2025-10-19 04:15:11.871034
882e87b5-6fe2-47c2-9c99-e8a3e65eedf8	1912443e-0ded-46d7-bb6a-90b4a1073574	2	available	\N	\N	2025-10-19 04:15:11.908846	2025-10-19 04:15:11.908846
9ffe51d7-e5fe-464f-9328-f79e3a4026f8	904c70ea-0b5b-4a20-93b0-dfbd9cb99e3a	1	available	\N	\N	2025-10-19 04:15:11.919281	2025-10-19 04:15:11.919281
23955819-8589-42e2-84ae-8a5b62b24193	1912443e-0ded-46d7-bb6a-90b4a1073574	3	available	\N	\N	2025-10-19 04:15:11.946588	2025-10-19 04:15:11.946588
6f638df4-6ca4-47ef-af9d-1f62ad747cf9	904c70ea-0b5b-4a20-93b0-dfbd9cb99e3a	2	available	\N	\N	2025-10-19 04:15:11.956919	2025-10-19 04:15:11.956919
a8aed33c-7d1a-44c5-9517-7be406eac022	1912443e-0ded-46d7-bb6a-90b4a1073574	4	available	\N	\N	2025-10-19 04:15:11.984389	2025-10-19 04:15:11.984389
c48729fe-23b7-4ad1-a112-4cd181123fd0	1912443e-0ded-46d7-bb6a-90b4a1073574	5	available	\N	\N	2025-10-19 04:15:12.022644	2025-10-19 04:15:12.022644
b369edf4-a863-49be-ab78-9f81b043ec14	0cda1784-8b63-4665-85c2-6a72e5ec9cd8	1	available	\N	\N	2025-10-19 04:15:12.032628	2025-10-19 04:15:12.032628
91b048d1-0c69-4042-8964-6ac8472f0754	0cda1784-8b63-4665-85c2-6a72e5ec9cd8	2	available	\N	\N	2025-10-19 04:15:12.070429	2025-10-19 04:15:12.070429
5b7206ab-935e-4da6-a646-29608e38c167	0cda1784-8b63-4665-85c2-6a72e5ec9cd8	3	available	\N	\N	2025-10-19 04:15:12.130246	2025-10-19 04:15:12.130246
fb965b0e-60fc-47c7-b9df-92a779ebdffe	0cda1784-8b63-4665-85c2-6a72e5ec9cd8	4	available	\N	\N	2025-10-19 04:15:12.267921	2025-10-19 04:15:12.267921
c243d4fc-9124-4433-a040-e3e4f0cbcdc4	0cda1784-8b63-4665-85c2-6a72e5ec9cd8	5	available	\N	\N	2025-10-19 04:15:12.54939	2025-10-19 04:15:12.54939
0bd2aabf-eb5d-4d5e-aa9a-ccf65196d386	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	1	available	\N	\N	2025-10-19 04:32:05.092354	2025-10-19 04:32:05.092354
bc5c1c65-446f-40e1-aa70-4d68f5278cea	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	2	available	\N	\N	2025-10-19 04:32:05.132713	2025-10-19 04:32:05.132713
c053f249-78b0-45e5-b999-fbfd4e2628f1	fa2af84c-6389-4136-87ab-2752e4951088	1	available	\N	\N	2025-10-19 04:52:55.000853	2025-10-19 04:52:55.000853
aef7c5e7-fddc-4006-80b5-3e668401e6a5	fa2af84c-6389-4136-87ab-2752e4951088	2	available	\N	\N	2025-10-19 04:52:55.042817	2025-10-19 04:52:55.042817
099c39d8-42fa-4c45-8f23-4378f312d58f	87d50d2b-74c6-4512-ac2f-70de046e95f4	1	available	\N	\N	2025-10-19 04:52:55.117358	2025-10-19 04:52:55.117358
9a0d916c-0ee1-4ec2-ba0d-081efbe01866	87d50d2b-74c6-4512-ac2f-70de046e95f4	2	available	\N	\N	2025-10-19 04:52:55.154648	2025-10-19 04:52:55.154648
6605d47e-dc2a-4695-a22c-c6d4221c4162	87d50d2b-74c6-4512-ac2f-70de046e95f4	3	available	\N	\N	2025-10-19 04:52:55.191839	2025-10-19 04:52:55.191839
3cb32dd0-9723-4568-9c32-b5e879e006b4	87d50d2b-74c6-4512-ac2f-70de046e95f4	4	available	\N	\N	2025-10-19 04:52:55.228694	2025-10-19 04:52:55.228694
c64db901-6af1-44a2-9564-862630f44f43	87d50d2b-74c6-4512-ac2f-70de046e95f4	5	available	\N	\N	2025-10-19 04:52:55.265748	2025-10-19 04:52:55.265748
c0abcaa1-7768-4040-a62e-a53f31fd9f51	bb8c99bd-210e-4a7e-8813-3f7214142fd4	1	available	\N	\N	2025-10-19 04:55:04.03298	2025-10-19 04:55:04.03298
f50b8023-24e7-4645-a218-b24b3e846fd4	bb8c99bd-210e-4a7e-8813-3f7214142fd4	2	available	\N	\N	2025-10-19 04:55:04.075205	2025-10-19 04:55:04.075205
3ebdd41b-c236-4eed-ac8c-fbf3e11849b7	bb8c99bd-210e-4a7e-8813-3f7214142fd4	3	available	\N	\N	2025-10-19 04:55:04.120628	2025-10-19 04:55:04.120628
b0a587ea-ee1e-48e5-8fd4-cc2d67476ce2	c6f99980-a942-4b83-a629-fe090b37048b	1	available	\N	\N	2025-10-19 04:55:04.198125	2025-10-19 04:55:04.198125
9a50de1f-79ad-46be-bcdd-7ba7ae8a3b17	c6f99980-a942-4b83-a629-fe090b37048b	2	available	\N	\N	2025-10-19 04:55:04.235704	2025-10-19 04:55:04.235704
47b1d490-b3c6-4fc2-9e3f-a19efe4644e4	c6f99980-a942-4b83-a629-fe090b37048b	3	available	\N	\N	2025-10-19 04:55:04.274018	2025-10-19 04:55:04.274018
bcf6083d-115a-4f80-8da4-a537797ab4a7	c6f99980-a942-4b83-a629-fe090b37048b	4	available	\N	\N	2025-10-19 04:55:04.312348	2025-10-19 04:55:04.312348
ec685f46-f273-4d32-960e-5ef2f5c6f6ef	45b31dfb-e80f-4746-a51f-edb907c7227e	1	available	\N	\N	2025-10-19 04:55:04.389189	2025-10-19 04:55:04.389189
54b76fd6-d4cd-4cd8-aa1a-1b978e39383b	45b31dfb-e80f-4746-a51f-edb907c7227e	2	available	\N	\N	2025-10-19 04:55:04.427988	2025-10-19 04:55:04.427988
30088793-d9ed-4d0b-b836-7cd380394e91	7af1b228-b8b0-4227-85fe-a29adb44dc1e	1	available	\N	\N	2025-10-19 06:29:49.209877	2025-10-19 06:29:49.209877
d81b3b55-ed48-40d4-84be-2225d7037dd9	7af1b228-b8b0-4227-85fe-a29adb44dc1e	2	available	\N	\N	2025-10-19 06:29:49.248442	2025-10-19 06:29:49.248442
01f7fb95-492a-4444-92a8-d13d7f6a5201	bc519f6c-bb39-4632-9105-ed8cbc35b474	1	available	\N	\N	2025-10-19 06:29:49.333736	2025-10-19 06:29:49.333736
da4be670-7ef7-49ba-8442-7fa4cdd09544	bc519f6c-bb39-4632-9105-ed8cbc35b474	2	available	\N	\N	2025-10-19 06:29:49.372408	2025-10-19 06:29:49.372408
e9ca128f-476c-4c8b-9e2f-790fdb018ab7	bc519f6c-bb39-4632-9105-ed8cbc35b474	3	available	\N	\N	2025-10-19 06:29:49.411115	2025-10-19 06:29:49.411115
df91b556-c233-464e-931a-0099b5c6b40a	9aaabcf6-e99c-4714-b665-7533a0631b20	1	available	\N	\N	2025-10-19 06:29:49.487898	2025-10-19 06:29:49.487898
894d8a1e-14f7-45ab-8d4e-32cc76d934b2	9aaabcf6-e99c-4714-b665-7533a0631b20	2	available	\N	\N	2025-10-19 06:29:49.52665	2025-10-19 06:29:49.52665
f68bbf84-7297-4a54-9486-7aab1c48ec2a	9aaabcf6-e99c-4714-b665-7533a0631b20	3	available	\N	\N	2025-10-19 06:29:49.565263	2025-10-19 06:29:49.565263
bbde0330-0732-4f2b-ac4d-1a3209a435ae	9aaabcf6-e99c-4714-b665-7533a0631b20	4	available	\N	\N	2025-10-19 06:29:49.603796	2025-10-19 06:29:49.603796
82a4baf9-5ad7-4bbb-a865-259fef845156	9aaabcf6-e99c-4714-b665-7533a0631b20	5	available	\N	\N	2025-10-19 06:29:49.643707	2025-10-19 06:29:49.643707
41d93cb6-2daa-4dd1-a048-a83c7aaa3c76	1f99d7f6-dfc9-4186-aa97-03100927db4d	1	available	\N	\N	2025-10-19 06:29:49.721106	2025-10-19 06:29:49.721106
8e9d9815-fcaa-43d2-a1ad-836a00e8e346	1f99d7f6-dfc9-4186-aa97-03100927db4d	2	available	\N	\N	2025-10-19 06:29:49.759793	2025-10-19 06:29:49.759793
ef5a36f9-7092-414a-9406-7b197ae36cfe	1f99d7f6-dfc9-4186-aa97-03100927db4d	3	available	\N	\N	2025-10-19 06:29:49.79823	2025-10-19 06:29:49.79823
\.


--
-- Data for Name: charges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.charges (id, tenant_id, assignment_id, month, amount, expected_amount, remaining_amount, days, calculation_type, due_date, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.countries (iso_code, name_tr, name_en, name_de, name_nl, name_fr, name_pl, name_bg, flag_emoji, phone_code, is_active, created_at, updated_at) FROM stdin;
DE	Almanya	Germany	Deutschland	Duitsland	Allemagne	Niemcy	Германия	🇩🇪	+49	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
NL	Hollanda	Netherlands	Niederlande	Nederland	Pays-Bas	Holandia	Холандия	🇳🇱	+31	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
TR	Türkiye	Turkey	Türkei	Turkije	Turquie	Turcja	Турция	🇹🇷	+90	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
PL	Polonya	Poland	Polen	Polen	Pologne	Polska	Полша	🇵🇱	+48	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
FR	Fransa	France	Frankreich	Frankrijk	France	Francja	Франция	🇫🇷	+33	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
BE	Belçika	Belgium	Belgien	België	Belgique	Belgia	Белгия	🇧🇪	+32	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
AT	Avusturya	Austria	Österreich	Oostenrijk	Autriche	Austria	Австрия	🇦🇹	+43	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
CH	İsviçre	Switzerland	Schweiz	Zwitserland	Suisse	Szwajcaria	Швейцария	🇨🇭	+41	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
GB	Birleşik Krallık	United Kingdom	Vereinigtes Königreich	Verenigd Koninkrijk	Royaume-Uni	Wielka Brytania	Обединено кралство	🇬🇧	+44	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
IE	İrlanda	Ireland	Irland	Ierland	Irlande	Irlandia	Ирландия	🇮🇪	+353	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
ES	İspanya	Spain	Spanien	Spanje	Espagne	Hiszpania	Испания	🇪🇸	+34	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
IT	İtalya	Italy	Italien	Italië	Italie	Włochy	Италия	🇮🇹	+39	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
PT	Portekiz	Portugal	Portugal	Portugal	Portugal	Portugalia	Португалия	🇵🇹	+351	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
RO	Romanya	Romania	Rumänien	Roemenië	Roumanie	Rumunia	Румъния	🇷🇴	+40	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
BG	Bulgaristan	Bulgaria	Bulgarien	Bulgarije	Bulgarie	Bułgaria	България	🇧🇬	+359	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
GR	Yunanistan	Greece	Griechenland	Griekenland	Grèce	Grecja	Гърция	🇬🇷	+30	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
CZ	Çekya	Czech Republic	Tschechien	Tsjechië	République tchèque	Czechy	Чехия	🇨🇿	+420	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
HU	Macaristan	Hungary	Ungarn	Hongarije	Hongrie	Węgry	Унгария	🇭🇺	+36	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
SK	Slovakya	Slovakia	Slowakei	Slowakije	Slovaquie	Słowacja	Словакия	🇸🇰	+421	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
SI	Slovenya	Slovenia	Slowenien	Slovenië	Slovénie	Słowenia	Словения	🇸🇮	+386	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
HR	Hırvatistan	Croatia	Kroatien	Kroatië	Croatie	Chorwacja	Хърватия	🇭🇷	+385	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
RS	Sırbistan	Serbia	Serbien	Servië	Serbie	Serbia	Сърбия	🇷🇸	+381	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
DK	Danimarka	Denmark	Dänemark	Denemarken	Danemark	Dania	Дания	🇩🇰	+45	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
SE	İsveç	Sweden	Schweden	Zweden	Suède	Szwecja	Швеция	🇸🇪	+46	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
NO	Norveç	Norway	Norwegen	Noorwegen	Norvège	Norwegia	Норвегия	🇳🇴	+47	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
FI	Finlandiya	Finland	Finnland	Finland	Finlande	Finlandia	Финландия	🇫🇮	+358	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
UA	Ukrayna	Ukraine	Ukraine	Oekraïne	Ukraine	Ukraina	Украйна	🇺🇦	+380	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
LT	Litvanya	Lithuania	Litauen	Litouwen	Lituanie	Litwa	Литва	🇱🇹	+370	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
LV	Letonya	Latvia	Lettland	Letland	Lettonie	Łotwa	Латвия	🇱🇻	+371	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
EE	Estonya	Estonia	Estland	Estland	Estonie	Estonia	Естония	🇪🇪	+372	t	2025-10-18 19:22:11.415	2025-10-18 19:22:11.415
\.


--
-- Data for Name: employment_private_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employment_private_data (id, employment_id, salary, salary_frequency, currency, contract_type, contract_start_date, contract_end_date, internal_notes, performance_rating, manager_id, created_at, updated_at) FROM stdin;
epd-1	emp-1	2500	monthly	EUR	full_time	2024-10-15	\N	Excellent worker, always on time. Recommended for team lead position.	4.5	user-1	2024-10-15 00:00:00	2024-10-15 00:00:00
epd-2	emp-2	2200	monthly	EUR	full_time	2024-11-01	\N	Reliable, good attention to detail	4.2	user-1	2024-11-01 00:00:00	2024-11-01 00:00:00
epd-3	emp-3	2400	monthly	EUR	full_time	2024-09-01	\N	Fast learner, excellent team player	4.7	user-1	2024-09-01 00:00:00	2024-09-01 00:00:00
epd-4	emp-4	2300	monthly	EUR	temporary	2024-11-10	2025-05-10	Seasonal worker, may extend contract	4.0	user-1	2024-11-10 00:00:00	2024-11-10 00:00:00
epd-5	emp-5	2600	monthly	EUR	full_time	2024-01-20	2024-10-31	Left for better opportunity. Would re-hire if needed.	4.3	user-1	2024-01-20 00:00:00	2024-10-31 00:00:00
epd-6	emp-6	2100	monthly	EUR	full_time	2024-05-10	\N	Great communication skills	4.1	user-1	2024-05-10 00:00:00	2024-05-10 00:00:00
epd-7	emp-7	2800	monthly	EUR	full_time	2024-03-15	\N	Strong leadership skills	4.6	user-1	2024-03-15 00:00:00	2024-03-15 00:00:00
epd-8	emp-8	2350	monthly	EUR	full_time	2024-04-20	\N	Very detail-oriented	4.4	user-1	2024-04-20 00:00:00	2024-04-20 00:00:00
epd-9	emp-9	2450	monthly	EUR	full_time	2024-02-28	\N	Quick problem solver	4.3	user-1	2024-02-28 00:00:00	2024-02-28 00:00:00
epd-10	emp-10	2150	monthly	EUR	full_time	2024-06-01	\N	Organized and efficient	4.2	user-1	2024-06-01 00:00:00	2024-06-01 00:00:00
epd-11	emp-11	3200	monthly	EUR	full_time	2024-01-10	\N	Senior manager, excellent track record	4.8	user-1	2024-01-10 00:00:00	2024-01-10 00:00:00
epd-12	emp-12	2250	monthly	EUR	full_time	2024-07-05	\N	Fast and accurate	4.1	user-1	2024-07-05 00:00:00	2024-07-05 00:00:00
\.


--
-- Data for Name: employments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employments (id, worker_profile_id, tenant_id, status, start_date, end_date, snapshot_gender, snapshot_photo, snapshot_first_name, snapshot_last_name, job_title, department, created_at, updated_at, created_by) FROM stdin;
emp-1	wp-1	tenant-cova	active	2024-10-15	\N	male	https://i.pravatar.cc/150?u=ahmet	Ahmet	Yılmaz	Warehouse Worker	Logistics	2024-10-15 00:00:00	2024-10-15 00:00:00	user-1
emp-2	wp-2	tenant-cova	active	2024-11-01	\N	male	https://i.pravatar.cc/150?u=mehmet	Mehmet	Demir	Cleaner	Facility Management	2024-11-01 00:00:00	2024-11-01 00:00:00	user-1
emp-3	wp-3	tenant-cova	active	2024-09-01	\N	female	https://i.pravatar.cc/150?u=ayse	Ayşe	Kaya	Factory Worker	Production	2024-09-01 00:00:00	2024-09-01 00:00:00	user-1
emp-4	wp-4	tenant-cova	active	2024-11-10	\N	female	https://i.pravatar.cc/150?u=fatma	Fatma	Şahin	Food Processor	Production	2024-11-10 00:00:00	2024-11-10 00:00:00	user-1
emp-5	wp-5	tenant-cova	former	2024-01-20	2024-10-31	male	https://i.pravatar.cc/150?u=ali	Ali	Öztürk	Logistics Coordinator	Logistics	2024-01-20 00:00:00	2024-10-31 00:00:00	user-1
emp-6	wp-6	tenant-cova	active	2024-05-10	\N	female	https://i.pravatar.cc/150?u=emma	Emma	Wilson	Customer Service	Administration	2024-05-10 00:00:00	2024-05-10 00:00:00	user-1
emp-8	wp-8	tenant-cova	active	2024-04-20	\N	female	https://i.pravatar.cc/150?u=lisa	Lisa	Schmidt	Quality Inspector	Production	2024-04-20 00:00:00	2024-04-20 00:00:00	user-1
emp-9	wp-9	tenant-cova	active	2024-02-28	\N	male	https://i.pravatar.cc/150?u=paul	Paul	Anderson	Maintenance Tech	Facility Management	2024-02-28 00:00:00	2024-02-28 00:00:00	user-1
emp-10	wp-10	tenant-cova	active	2024-06-01	\N	female	https://i.pravatar.cc/150?u=anna	Anna	Kowalski	Admin Assistant	Administration	2024-06-01 00:00:00	2024-06-01 00:00:00	user-1
emp-11	wp-11	tenant-cova	active	2024-01-10	\N	male	https://i.pravatar.cc/150?u=klaus	Klaus	Wagner	Production Manager	Production	2024-01-10 00:00:00	2024-01-10 00:00:00	user-1
emp-12	wp-12	tenant-cova	active	2024-07-05	\N	male	https://i.pravatar.cc/150?u=mustafa	Mustafa	Yıldırım	Packaging Specialist	Production	2024-07-05 00:00:00	2024-07-05 00:00:00	user-1
emp-7	wp-7	tenant-cova	active	2024-03-15	\N	male	https://i.pravatar.cc/150?u=tom	Tom	Müller	Warehouse Supervisor	Logistics	2024-03-15 00:00:00	2025-10-19 04:00:23.152	user-1
7dcd6847-6341-49cd-bbf2-724ef0e284d9	4b6e8d87-fe5a-4dd0-8180-28e91b5b3553	tenant-cova	active	2025-10-19	\N	male	\N	Test	Worker	\N	\N	2025-10-19 04:16:11.023776	2025-10-19 04:16:11.023776	\N
\.


--
-- Data for Name: houses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.houses (id, tenant_id, name, address, house_number, house_number_addition, postal_code, city, country, latitude, longitude, total_rooms, total_beds, cost_per_week, cost_per_bed_per_day, ownership_type, status, description, internal_notes, created_at, updated_at) FROM stdin;
e60a783a-5751-4afc-a1a2-53f083fef466	tenant-cova	Test Street 123	Test Street 123	\N	\N	\N	Amsterdam	Hollanda	\N	\N	0	0	\N	\N	rent	active	\N	\N	2025-10-19 04:24:48.231311	2025-10-19 04:32:02.177
ae615006-b352-4ff4-b931-02f1698c6174	tenant-cova	Oranje straat 1	Oranje straat 1	\N	\N	\N	Eindhoven	Hollanda	\N	\N	0	0	\N	\N	rent	active	\N	\N	2025-10-19 03:57:58.78709	2025-10-19 04:52:54.494
5f0a4e94-3b68-4b84-8b78-56ac0ce92346	tenant-cova	Final Test House	Final Test House	\N	\N	\N	Rotterdam	Hollanda	\N	\N	0	0	\N	\N	rent	active	\N	\N	2025-10-19 04:40:15.104648	2025-10-19 04:55:01.232
2c29cf4a-52ef-44a2-9250-1874d54cd6d5	tenant-cova	Test house 1	Test house 1	\N	\N	\N	Venlo	Hollanda	\N	\N	0	0	\N	\N	rent	active	\N	\N	2025-10-19 04:21:44.212124	2025-10-19 06:29:48.238
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, tenant_id, charge_id, amount, payment_date, payment_method, collector_name, recorded_at, reference, notes, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: platform_admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_admins (id, email, password, first_name, last_name, role, last_login_at, created_at, updated_at) FROM stdin;
platform-admin-1	tahir@arpdo.com	$2b$10$u4sWHn3bMnlABUZYUgTMueiodv/FCOIS2Zsq4ndM82CORfyIEFOYi	Tahir	Çetin	super_admin	\N	2024-01-01 00:00:00	2024-01-01 00:00:00
platform-admin-2	admin@arpdo.com	$2b$10$zvf1NaDn8ehyDQ5mOyMTzuU8Olb0pWE.2xTVSnie0pEN1AejxljI6	Platform	Admin	admin	\N	2024-01-15 00:00:00	2024-01-15 00:00:00
\.


--
-- Data for Name: qr_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.qr_codes (id, tenant_id, type, code, title, status, usage_limit, used_count, expiry_date, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservations (id, employment_id, house_id, room_id, bed_id, tenant_id, start_date, end_date, check_in_date, check_out_date, status, daily_rate, total_cost, on_vacation, belongings_in_room, description, internal_notes, confirmed_by, confirmed_at, created_at, updated_at, created_by, notes) FROM stdin;
7f1465fc-3b0f-458d-915a-b70fd844f73a	emp-1	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	a85ebaf5-1a3a-48e6-9a65-c86fb0cb8ef7	605d545c-4fe5-4e95-b7a9-338738cf86df	tenant-cova	2025-10-19	\N	2025-10-19	\N	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 05:23:47.696917	2025-10-19 05:23:47.696917	\N	\N
6d0c6b36-b481-4a8a-9191-c776285b305e	emp-1	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	b0e695aa-fd82-4d3d-bb61-4f00edc0822d	fc8670ba-61f9-4cf5-a078-56df5b00b2cf	tenant-cova	2025-10-22	\N	2025-10-22	\N	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 05:28:21.282296	2025-10-19 05:28:21.282296	\N	\N
dd0d994d-156c-48ed-a743-277fc352755a	emp-8	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	b0e695aa-fd82-4d3d-bb61-4f00edc0822d	124343d0-e08a-4b71-86f6-ce74ae05c722	tenant-cova	2025-10-18	\N	2025-10-18	\N	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 05:51:07.803641	2025-10-19 05:51:07.803641	\N	\N
52c7c455-a4a0-454c-98e2-3a562a155883	emp-2	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	a85ebaf5-1a3a-48e6-9a65-c86fb0cb8ef7	02f2d357-c344-4fc8-ac4b-da5d36ea7954	tenant-cova	2025-10-24	\N	2025-10-24	\N	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 05:56:02.639211	2025-10-19 05:56:02.639211	\N	\N
fd48963e-2446-48e7-9c9b-b29bbdc1e88a	emp-1	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	0bd2aabf-eb5d-4d5e-aa9a-ccf65196d386	tenant-cova	2025-10-22	\N	2025-10-22	\N	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 06:23:59.205327	2025-10-19 06:23:59.205327	\N	\N
3162f829-a78e-43d3-87e6-0bf8079ad597	emp-3	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	bc519f6c-bb39-4632-9105-ed8cbc35b474	e9ca128f-476c-4c8b-9e2f-790fdb018ab7	tenant-cova	2025-10-23	\N	2025-10-23	\N	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 06:33:10.907052	2025-10-19 06:33:10.907052	\N	\N
fd5141ff-a32f-438f-ac82-468bd6fdb794	emp-1	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	tenant-cova	2025-10-19	\N	2025-10-19	2025-10-19	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 16:50:37.203375	2025-10-19 16:53:33.925	\N	{"[immediate] Checkout bug fix BtFBdV"}
ad2c95ec-886e-40e4-b1f0-bf793760cb6d	emp-2	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	9aaabcf6-e99c-4714-b665-7533a0631b20	bbde0330-0732-4f2b-ac4d-1a3209a435ae	tenant-cova	2025-09-30	2025-10-30	2025-09-30	2025-10-25	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 06:51:00.403842	2025-10-19 14:00:00.482	\N	\N
e26d7bde-6e61-44ce-9af0-cb44078af119	emp-1	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	7af1b228-b8b0-4227-85fe-a29adb44dc1e	30088793-d9ed-4d0b-b836-7cd380394e91	tenant-cova	2025-10-07	\N	2025-10-07	2026-01-01	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 06:32:02.479654	2025-10-19 14:04:42.663	\N	\N
776f9422-1b78-4a98-b968-956afa810704	emp-2	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	tenant-cova	2025-10-01	\N	2025-10-01	2025-10-31	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 17:10:20.574164	2025-10-19 17:11:03.936	\N	{"[future] test not"}
84515bdb-6033-4412-9c3e-08d42b04cb9c	emp-2	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	7af1b228-b8b0-4227-85fe-a29adb44dc1e	d81b3b55-ed48-40d4-84be-2225d7037dd9	tenant-cova	2025-10-01	\N	2025-10-01	2025-10-30	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 16:13:59.291236	2025-10-19 17:18:02.271	\N	{"[future] yeni çıkış"}
eaf27145-609d-46d4-8bd8-17aac550f6fa	emp-1	5f0a4e94-3b68-4b84-8b78-56ac0ce92346	bb8c99bd-210e-4a7e-8813-3f7214142fd4	c0abcaa1-7768-4040-a62e-a53f31fd9f51	tenant-cova	2025-10-19	\N	2025-10-19	2025-10-25	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 17:36:47.502427	2025-10-19 17:38:39.315	\N	{"[future] Test future checkout - should remain occupied"}
44525b8f-eb5c-4721-bac5-cb9aead1bd27	emp-6	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	bc519f6c-bb39-4632-9105-ed8cbc35b474	01f7fb95-492a-4444-92a8-d13d7f6a5201	tenant-cova	2025-09-30	2025-12-30	2025-09-30	2025-10-22	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 13:15:45.274954	2025-10-19 14:34:48.049	\N	\N
d90514dd-071e-4e82-9f68-00b69cb46559	emp-9	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	9aaabcf6-e99c-4714-b665-7533a0631b20	894d8a1e-14f7-45ab-8d4e-32cc76d934b2	tenant-cova	2025-09-30	\N	2025-09-30	2025-10-22	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 06:39:31.364128	2025-10-19 14:46:11.866	\N	\N
97abfea0-6468-493f-9e53-268e4e647b94	emp-1	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	tenant-cova	2025-10-19	\N	2025-10-19	2025-10-31	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 07:25:27.936161	2025-10-19 16:06:07.635	\N	\N
ee5daa96-eb75-4f08-9e21-d06c20ae1789	emp-1	e60a783a-5751-4afc-a1a2-53f083fef466	a5c868f4-c3ab-4bd1-827f-af07d5c5305c	bc5c1c65-446f-40e1-aa70-4d68f5278cea	tenant-cova	2025-09-30	\N	2025-09-30	2025-10-31	checked_in	\N	\N	f	f	\N	\N	\N	\N	2025-10-19 16:08:32.099343	2025-10-19 16:09:00.588	\N	\N
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, house_id, room_number, floor, room_type, bed_count, gender_restriction, is_family_room, status, cost_per_day, created_at, updated_at) FROM stdin;
9f78363d-3994-48e7-8a4f-5c412e5d35aa	91f474f4-ad2e-4d3b-8f99-b0151c7a0f33	1	\N	\N	2	none	f	active	\N	2025-10-19 04:15:09.537407	2025-10-19 04:15:09.537407
fbd8805b-c9a9-463f-a7d9-6a643c24be54	91f474f4-ad2e-4d3b-8f99-b0151c7a0f33	2	\N	\N	6	none	f	active	\N	2025-10-19 04:15:09.676068	2025-10-19 04:15:09.676068
1e87d8c8-7682-4dd9-8215-35161a717d2d	91f474f4-ad2e-4d3b-8f99-b0151c7a0f33	3	\N	\N	2	none	f	active	\N	2025-10-19 04:15:09.944463	2025-10-19 04:15:09.944463
29396337-2a9d-4dba-8c97-5a8f21a6a905	91f474f4-ad2e-4d3b-8f99-b0151c7a0f33	4	\N	\N	5	none	f	active	\N	2025-10-19 04:15:10.058336	2025-10-19 04:15:10.058336
7a67d399-2033-4571-bf8f-9629686e2fc6	4a2f0c1c-ccdb-4347-abe2-22f3cc4c8d02	1	\N	\N	2	none	f	active	\N	2025-10-19 04:15:10.467043	2025-10-19 04:15:10.467043
638db7fb-5b98-4d76-b2b3-32ed00e613f3	4a2f0c1c-ccdb-4347-abe2-22f3cc4c8d02	2	\N	\N	6	none	f	active	\N	2025-10-19 04:15:10.584259	2025-10-19 04:15:10.584259
e1853f71-8baf-461f-8af6-3524097c027a	1fdbe49a-2651-4166-815f-e854be98f7f9	1	\N	\N	2	none	f	active	\N	2025-10-19 04:15:10.822387	2025-10-19 04:15:10.822387
38294ac9-d36d-42f4-9442-92d9afb530fa	4a2f0c1c-ccdb-4347-abe2-22f3cc4c8d02	3	\N	\N	2	none	f	active	\N	2025-10-19 04:15:10.853467	2025-10-19 04:15:10.853467
5068dd24-316c-4aa4-844e-0f5f4dfd62ba	1fdbe49a-2651-4166-815f-e854be98f7f9	2	\N	\N	6	none	f	active	\N	2025-10-19 04:15:10.93887	2025-10-19 04:15:10.93887
8dd799da-21e9-4b80-8e1a-e0c8c885329c	4a2f0c1c-ccdb-4347-abe2-22f3cc4c8d02	4	\N	\N	5	none	f	active	\N	2025-10-19 04:15:10.96874	2025-10-19 04:15:10.96874
aec13621-b762-41fa-afcc-ff1920000704	beaf2fcb-a507-40de-9984-865df65f9135	1	\N	\N	2	none	f	active	\N	2025-10-19 04:15:11.016595	2025-10-19 04:15:11.016595
9b806869-1673-4cd2-ada0-b99ed08beb2a	beaf2fcb-a507-40de-9984-865df65f9135	2	\N	\N	6	none	f	active	\N	2025-10-19 04:15:11.132981	2025-10-19 04:15:11.132981
7db25105-f6be-46f4-a456-c8c582eca76d	1fdbe49a-2651-4166-815f-e854be98f7f9	3	\N	\N	2	none	f	active	\N	2025-10-19 04:15:11.205507	2025-10-19 04:15:11.205507
9e048491-46e8-45e5-b5a0-4fcf1ab9d64d	376fa10f-b0ab-41df-b754-712cfec37a67	1	\N	\N	2	none	f	active	\N	2025-10-19 04:15:11.205117	2025-10-19 04:15:11.205117
70c690a7-8caf-4f0b-8046-ce27a15b2ab3	376fa10f-b0ab-41df-b754-712cfec37a67	2	\N	\N	6	none	f	active	\N	2025-10-19 04:15:11.324115	2025-10-19 04:15:11.324115
a0fe6564-10fd-45f1-afe7-98979cbd0c4a	1fdbe49a-2651-4166-815f-e854be98f7f9	4	\N	\N	5	none	f	active	\N	2025-10-19 04:15:11.325912	2025-10-19 04:15:11.325912
c3ce8c2f-9f7e-4e68-9492-46ee4ecf45af	beaf2fcb-a507-40de-9984-865df65f9135	3	\N	\N	2	none	f	active	\N	2025-10-19 04:15:11.405101	2025-10-19 04:15:11.405101
1912443e-0ded-46d7-bb6a-90b4a1073574	beaf2fcb-a507-40de-9984-865df65f9135	4	\N	\N	5	none	f	active	\N	2025-10-19 04:15:11.759782	2025-10-19 04:15:11.759782
904c70ea-0b5b-4a20-93b0-dfbd9cb99e3a	376fa10f-b0ab-41df-b754-712cfec37a67	3	\N	\N	2	none	f	active	\N	2025-10-19 04:15:11.872278	2025-10-19 04:15:11.872278
0cda1784-8b63-4665-85c2-6a72e5ec9cd8	376fa10f-b0ab-41df-b754-712cfec37a67	4	\N	\N	5	none	f	active	\N	2025-10-19 04:15:11.994513	2025-10-19 04:15:11.994513
a5c868f4-c3ab-4bd1-827f-af07d5c5305c	e60a783a-5751-4afc-a1a2-53f083fef466	1	\N	\N	2	none	f	active	\N	2025-10-19 04:32:05.046118	2025-10-19 04:32:05.046118
fa2af84c-6389-4136-87ab-2752e4951088	ae615006-b352-4ff4-b931-02f1698c6174	101	1	\N	2	none	f	active	\N	2025-10-19 04:52:54.962552	2025-10-19 04:52:54.962552
87d50d2b-74c6-4512-ac2f-70de046e95f4	ae615006-b352-4ff4-b931-02f1698c6174	201	2	\N	5	none	f	active	\N	2025-10-19 04:52:55.080191	2025-10-19 04:52:55.080191
bb8c99bd-210e-4a7e-8813-3f7214142fd4	5f0a4e94-3b68-4b84-8b78-56ac0ce92346	1	\N	\N	3	none	f	active	\N	2025-10-19 04:55:03.988033	2025-10-19 04:55:03.988033
c6f99980-a942-4b83-a629-fe090b37048b	5f0a4e94-3b68-4b84-8b78-56ac0ce92346	2	\N	\N	4	none	f	active	\N	2025-10-19 04:55:04.15926	2025-10-19 04:55:04.15926
45b31dfb-e80f-4746-a51f-edb907c7227e	5f0a4e94-3b68-4b84-8b78-56ac0ce92346	3	\N	\N	2	none	f	active	\N	2025-10-19 04:55:04.35084	2025-10-19 04:55:04.35084
7af1b228-b8b0-4227-85fe-a29adb44dc1e	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	1	\N	\N	2	none	f	active	\N	2025-10-19 06:29:49.166316	2025-10-19 06:29:49.166316
bc519f6c-bb39-4632-9105-ed8cbc35b474	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	2	\N	\N	3	none	f	active	\N	2025-10-19 06:29:49.287203	2025-10-19 06:29:49.287203
9aaabcf6-e99c-4714-b665-7533a0631b20	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	3	\N	\N	5	none	f	active	\N	2025-10-19 06:29:49.449504	2025-10-19 06:29:49.449504
1f99d7f6-dfc9-4186-aa97-03100927db4d	2c29cf4a-52ef-44a2-9250-1874d54cd6d5	4	\N	\N	3	none	f	active	\N	2025-10-19 06:29:49.682462	2025-10-19 06:29:49.682462
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, name, slug, type, status, contact_email, contact_phone, plan, trial_ends_at, subscription_starts_at, modules, currency, favorite_countries, default_country, created_at, updated_at, created_by, pricing_settings, timezone) FROM stdin;
tenant-apple	Apple Netherlands	apple-nl	direct_employer	trial	hr@apple.nl	+31 20 1234567	enterprise	2025-11-01 19:22:11.416	\N	"{\\"workers\\":true,\\"planning\\":true,\\"accommodation\\":false,\\"transport\\":true,\\"finance\\":true}"	EUR	{NL,GB,US}	NL	2024-10-01 00:00:00	2024-10-01 00:00:00	platform-admin-1	{"standardPricing": {"bedDailyPrice": 25, "roomDailyPrice": 70, "bedMonthlyPrice": 600, "roomMonthlyPrice": 1700}, "dailyRentalEnabled": false}	UTC
tenant-oneflex	OneFlex B.V.	oneflex	staffing_agency	active	contact@oneflex.nl	+31 20 9876543	professional	\N	2024-06-01 00:00:00	"{\\"workers\\":true,\\"planning\\":true,\\"accommodation\\":true,\\"transport\\":true,\\"finance\\":false}"	EUR	{NL,DE,BE}	NL	2024-06-01 00:00:00	2024-06-01 00:00:00	platform-admin-1	{"standardPricing": {"bedDailyPrice": 25, "roomDailyPrice": 70, "bedMonthlyPrice": 600, "roomMonthlyPrice": 1700}, "dailyRentalEnabled": false}	UTC
tenant-cova	Cova B.V.	cova-bv	staffing_agency	active	info@cova.nl	+31 40 1234567	professional	\N	2024-01-15 00:00:00	"{\\"workers\\":true,\\"planning\\":true,\\"accommodation\\":true,\\"transport\\":false,\\"finance\\":false}"	EUR	{DE,NL,TR,PL}	NL	2024-01-15 00:00:00	2025-10-19 05:29:02.242	platform-admin-1	{"standardPricing": {"bedDailyPrice": 25, "roomDailyPrice": 70, "bedMonthlyPrice": 600, "roomMonthlyPrice": 1700}, "dailyRentalEnabled": false}	UTC
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (email, last_tenant_id, last_selections, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, tenant_id, email, password, first_name, last_name, roles, status, invited_at, invited_by, activated_at, invitation_token, last_login_at, created_at, updated_at) FROM stdin;
user-cova-owner	tenant-cova	jan@cova.nl	$2b$10$3JuG8fX.Huj3N0dRR7e/z.E0LazSCvINqehli.2Nckf0NtVA/Qxni	Jan	de Vries	{owner}	active	2024-01-15 00:00:00	platform-admin-1	2024-01-15 00:00:00	\N	2024-10-18 00:00:00	2024-01-15 00:00:00	2024-10-18 00:00:00
user-cova-admin	tenant-cova	lisa@cova.nl	$2b$10$jKQJEgKDrPwGD3yx/pdv1e0mOiYRQy1TStBv54gJg/TZd62L4Oeei	Lisa	Janssen	{admin}	active	2024-02-01 00:00:00	user-cova-owner	2024-02-01 00:00:00	\N	2024-10-17 00:00:00	2024-02-01 00:00:00	2024-10-17 00:00:00
user-apple-owner	tenant-apple	tim@apple.nl	$2b$10$4vd9MwrRn9AWgM7sWyDWKOEjmopbqizhluYTIJb1HeZBJ3FYJc.xe	Tim	Cook	{owner}	active	2024-10-01 00:00:00	platform-admin-1	2024-10-01 00:00:00	\N	2024-10-18 00:00:00	2024-10-01 00:00:00	2024-10-18 00:00:00
user-apple-fatma	tenant-apple	fatma.yilmaz@gmail.com	$2b$10$M8AKjnGHXV9u6d/gtoUgbOxtQnzbqDXSKlkvyRbcCD.SNCFajKoAy	Fatma	Yılmaz	{hr_manager}	active	2024-10-05 00:00:00	user-apple-owner	2024-10-05 00:00:00	\N	2024-10-17 00:00:00	2024-10-05 00:00:00	2024-10-17 00:00:00
user-oneflex-owner	tenant-oneflex	sophie@oneflex.nl	$2b$10$SX49cSlGk/7lsJmdraD4c.NvCcTPUEkPPoJaX0vfW62gO.wIWIBAu	Sophie	van der Berg	{owner}	active	2024-06-01 00:00:00	platform-admin-1	2024-06-01 00:00:00	\N	2024-10-16 00:00:00	2024-06-01 00:00:00	2024-10-16 00:00:00
user-oneflex-pending	tenant-oneflex	mark@oneflex.nl	\N	Mark	Peters	{viewer}	invited	2024-10-10 00:00:00	user-oneflex-owner	\N	invite_token_abc123	\N	2024-10-10 00:00:00	2024-10-10 00:00:00
user-cova-fatma	tenant-cova	fatma.yilmaz@gmail.com	$2b$10$rHjNVA.UIq3RGguCx24PTOkD.dF2kbuWnqBUiyMZk1FLX.Dt7mRGS	Fatma	Yılmaz	{planner,finance}	active	2024-03-01 00:00:00	user-cova-owner	2024-03-01 00:00:00	\N	2024-10-18 00:00:00	2024-03-01 00:00:00	2024-10-18 00:00:00
\.


--
-- Data for Name: worker_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worker_profiles (id, email, password, first_name, last_name, gender, phone, nationality, date_of_birth, photo, bio, address, created_at, updated_at) FROM stdin;
wp-1	ahmet.yilmaz@worker.com	hashed_password	Ahmet	Yılmaz	male	+31 6 1234 5678	Türkiye	1990-05-15	https://i.pravatar.cc/150?u=ahmet	Experienced warehouse worker with 5 years of experience	Amsterdam, Netherlands	2024-01-15 00:00:00	2024-01-15 00:00:00
wp-2	mehmet.demir@worker.com	hashed_password	Mehmet	Demir	male	+31 6 2345 6789	Türkiye	1988-08-22	https://i.pravatar.cc/150?u=mehmet	Reliable cleaner, punctual and detail-oriented	Rotterdam, Netherlands	2024-02-10 00:00:00	2024-02-10 00:00:00
wp-3	ayse.kaya@worker.com	hashed_password	Ayşe	Kaya	female	+31 6 3456 7890	Türkiye	1995-03-10	https://i.pravatar.cc/150?u=ayse	Factory worker with excellent attendance record	Utrecht, Netherlands	2024-03-05 00:00:00	2024-03-05 00:00:00
wp-4	fatma.sahin@worker.com	hashed_password	Fatma	Şahin	female	+31 6 4567 8901	Türkiye	1992-11-20	https://i.pravatar.cc/150?u=fatma	Food processing specialist	The Hague, Netherlands	2024-04-01 00:00:00	2024-04-01 00:00:00
wp-5	ali.ozturk@worker.com	hashed_password	Ali	Öztürk	male	+31 6 5678 9012	Türkiye	1987-07-14	https://i.pravatar.cc/150?u=ali	Logistics coordinator with forklift certification	Eindhoven, Netherlands	2024-01-20 00:00:00	2024-01-20 00:00:00
wp-6	emma.wilson@worker.com	hashed_password	Emma	Wilson	female	+31 6 6789 0123	United Kingdom	1994-02-18	https://i.pravatar.cc/150?u=emma	Customer service specialist	Den Haag, Netherlands	2024-05-10 00:00:00	2024-05-10 00:00:00
wp-7	tom.mueller@worker.com	hashed_password	Tom	Müller	male	+49 151 2345 6789	Germany	1991-09-25	https://i.pravatar.cc/150?u=tom	Warehouse supervisor with 8 years experience	Berlin, Germany	2024-03-15 00:00:00	2024-03-15 00:00:00
wp-8	lisa.schmidt@worker.com	hashed_password	Lisa	Schmidt	female	+49 162 3456 7890	Germany	1993-06-30	https://i.pravatar.cc/150?u=lisa	Quality control inspector	Munich, Germany	2024-04-20 00:00:00	2024-04-20 00:00:00
wp-9	paul.anderson@worker.com	hashed_password	Paul	Anderson	male	+44 7700 900123	United Kingdom	1989-11-12	https://i.pravatar.cc/150?u=paul	Maintenance technician	London, United Kingdom	2024-02-28 00:00:00	2024-02-28 00:00:00
wp-10	anna.kowalski@worker.com	hashed_password	Anna	Kowalski	female	+48 600 123 456	Poland	1996-04-08	https://i.pravatar.cc/150?u=anna	Administrative assistant	Warsaw, Poland	2024-06-01 00:00:00	2024-06-01 00:00:00
wp-11	klaus.wagner@worker.com	hashed_password	Klaus	Wagner	male	+49 171 9876 543	Germany	1985-12-03	https://i.pravatar.cc/150?u=klaus	Senior production manager	Hamburg, Germany	2024-01-10 00:00:00	2024-01-10 00:00:00
wp-12	mustafa.yildirim@worker.com	hashed_password	Mustafa	Yıldırım	male	+31 6 7890 1234	Türkiye	1992-08-17	https://i.pravatar.cc/150?u=mustafa	Packaging specialist	Eindhoven, Netherlands	2024-07-05 00:00:00	2024-07-05 00:00:00
4b6e8d87-fe5a-4dd0-8180-28e91b5b3553	test.worker@worker.com	\N	Test	Worker	male	+31 6 0000 0000	Türkiye	2025-10-15	\N	\N	\N	2025-10-19 04:16:10.979934	2025-10-19 04:16:10.979934
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: assignment_notes assignment_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_notes
    ADD CONSTRAINT assignment_notes_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: beds beds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_pkey PRIMARY KEY (id);


--
-- Name: charges charges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charges
    ADD CONSTRAINT charges_pkey PRIMARY KEY (id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (iso_code);


--
-- Name: employment_private_data employment_private_data_employment_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employment_private_data
    ADD CONSTRAINT employment_private_data_employment_id_unique UNIQUE (employment_id);


--
-- Name: employment_private_data employment_private_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employment_private_data
    ADD CONSTRAINT employment_private_data_pkey PRIMARY KEY (id);


--
-- Name: employments employments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employments
    ADD CONSTRAINT employments_pkey PRIMARY KEY (id);


--
-- Name: houses houses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_admins platform_admins_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_email_unique UNIQUE (email);


--
-- Name: platform_admins platform_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_pkey PRIMARY KEY (id);


--
-- Name: qr_codes qr_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_code_unique UNIQUE (code);


--
-- Name: qr_codes qr_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_tenant_id_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_email_unique UNIQUE (tenant_id, email);


--
-- Name: worker_profiles worker_profiles_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_email_unique UNIQUE (email);


--
-- Name: worker_profiles worker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_profiles
    ADD CONSTRAINT worker_profiles_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

