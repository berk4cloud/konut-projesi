CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
ALTER TABLE IF EXISTS ONLY public.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_pkey;
ALTER TABLE IF EXISTS ONLY public.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_email_unique;
ALTER TABLE IF EXISTS ONLY public.houses DROP CONSTRAINT IF EXISTS houses_pkey;
ALTER TABLE IF EXISTS ONLY public.employments DROP CONSTRAINT IF EXISTS employments_pkey;
ALTER TABLE IF EXISTS ONLY public.employment_private_data DROP CONSTRAINT IF EXISTS employment_private_data_pkey;
ALTER TABLE IF EXISTS ONLY public.employment_private_data DROP CONSTRAINT IF EXISTS employment_private_data_employment_id_unique;
ALTER TABLE IF EXISTS ONLY public.countries DROP CONSTRAINT IF EXISTS countries_pkey;
ALTER TABLE IF EXISTS ONLY public.beds DROP CONSTRAINT IF EXISTS beds_pkey;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.worker_profiles;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_preferences;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.rooms;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.platform_admins;
DROP TABLE IF EXISTS public.houses;
DROP TABLE IF EXISTS public.employments;
DROP TABLE IF EXISTS public.employment_private_data;
DROP TABLE IF EXISTS public.countries;
DROP TABLE IF EXISTS public.beds;
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
DROP TYPE IF EXISTS public.platform_admin_role;
DROP TYPE IF EXISTS public.ownership_type;
DROP TYPE IF EXISTS public.house_status;
DROP TYPE IF EXISTS public.gender_restriction;
DROP TYPE IF EXISTS public.employment_status;
DROP TYPE IF EXISTS public.currency;
DROP TYPE IF EXISTS public.bed_status;
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
-- Name: bed_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bed_status AS ENUM (
    'available',
    'occupied',
    'reserved',
    'out_of_service'
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
-- Name: platform_admin_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.platform_admin_role AS ENUM (
    'super_admin',
    'admin',
    'support'
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
    created_by character varying
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
    created_by character varying
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
1	7182b6d81cef7e87a45f8f596ddf252977a1f71653dae8f2f8488cdef1e88c65	1760814249834
\.


--
-- Data for Name: beds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beds (id, room_id, bed_number, status, last_occupied_by, last_occupied_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.countries (iso_code, name_tr, name_en, name_de, name_nl, name_fr, name_pl, name_bg, flag_emoji, phone_code, is_active, created_at, updated_at) FROM stdin;
DE	Almanya	Germany	Deutschland	Duitsland	Allemagne	Niemcy	Германия	🇩🇪	+49	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
NL	Hollanda	Netherlands	Niederlande	Nederland	Pays-Bas	Holandia	Холандия	🇳🇱	+31	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
TR	Türkiye	Turkey	Türkei	Turkije	Turquie	Turcja	Турция	🇹🇷	+90	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
PL	Polonya	Poland	Polen	Polen	Pologne	Polska	Полша	🇵🇱	+48	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
FR	Fransa	France	Frankreich	Frankrijk	France	Francja	Франция	🇫🇷	+33	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
BE	Belçika	Belgium	Belgien	België	Belgique	Belgia	Белгия	🇧🇪	+32	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
AT	Avusturya	Austria	Österreich	Oostenrijk	Autriche	Austria	Австрия	🇦🇹	+43	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
CH	İsviçre	Switzerland	Schweiz	Zwitserland	Suisse	Szwajcaria	Швейцария	🇨🇭	+41	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
GB	Birleşik Krallık	United Kingdom	Vereinigtes Königreich	Verenigd Koninkrijk	Royaume-Uni	Wielka Brytania	Обединено кралство	🇬🇧	+44	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
IE	İrlanda	Ireland	Irland	Ierland	Irlande	Irlandia	Ирландия	🇮🇪	+353	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
ES	İspanya	Spain	Spanien	Spanje	Espagne	Hiszpania	Испания	🇪🇸	+34	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
IT	İtalya	Italy	Italien	Italië	Italie	Włochy	Италия	🇮🇹	+39	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
PT	Portekiz	Portugal	Portugal	Portugal	Portugal	Portugalia	Португалия	🇵🇹	+351	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
RO	Romanya	Romania	Rumänien	Roemenië	Roumanie	Rumunia	Румъния	🇷🇴	+40	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
BG	Bulgaristan	Bulgaria	Bulgarien	Bulgarije	Bulgarie	Bułgaria	България	🇧🇬	+359	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
GR	Yunanistan	Greece	Griechenland	Griekenland	Grèce	Grecja	Гърция	🇬🇷	+30	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
CZ	Çekya	Czech Republic	Tschechien	Tsjechië	République tchèque	Czechy	Чехия	🇨🇿	+420	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
HU	Macaristan	Hungary	Ungarn	Hongarije	Hongrie	Węgry	Унгария	🇭🇺	+36	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
SK	Slovakya	Slovakia	Slowakei	Slowakije	Slovaquie	Słowacja	Словакия	🇸🇰	+421	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
SI	Slovenya	Slovenia	Slowenien	Slovenië	Slovénie	Słowenia	Словения	🇸🇮	+386	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
HR	Hırvatistan	Croatia	Kroatien	Kroatië	Croatie	Chorwacja	Хърватия	🇭🇷	+385	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
RS	Sırbistan	Serbia	Serbien	Servië	Serbie	Serbia	Сърбия	🇷🇸	+381	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
DK	Danimarka	Denmark	Dänemark	Denemarken	Danemark	Dania	Дания	🇩🇰	+45	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
SE	İsveç	Sweden	Schweden	Zweden	Suède	Szwecja	Швеция	🇸🇪	+46	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
NO	Norveç	Norway	Norwegen	Noorwegen	Norvège	Norwegia	Норвегия	🇳🇴	+47	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
FI	Finlandiya	Finland	Finnland	Finland	Finlande	Finlandia	Финландия	🇫🇮	+358	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
UA	Ukrayna	Ukraine	Ukraine	Oekraïne	Ukraine	Ukraina	Украйна	🇺🇦	+380	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
LT	Litvanya	Lithuania	Litauen	Litouwen	Lituanie	Litwa	Литва	🇱🇹	+370	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
LV	Letonya	Latvia	Lettland	Letland	Lettonie	Łotwa	Латвия	🇱🇻	+371	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
EE	Estonya	Estonia	Estland	Estland	Estonie	Estonia	Естония	🇪🇪	+372	t	2025-10-18 19:06:45.503	2025-10-18 19:06:45.503
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
emp-1	wp-1	cova	active	2024-10-15	\N	male	https://i.pravatar.cc/150?u=ahmet	Ahmet	Yılmaz	Warehouse Worker	Logistics	2024-10-15 00:00:00	2024-10-15 00:00:00	user-1
emp-2	wp-2	cova	active	2024-11-01	\N	male	https://i.pravatar.cc/150?u=mehmet	Mehmet	Demir	Cleaner	Facility Management	2024-11-01 00:00:00	2024-11-01 00:00:00	user-1
emp-3	wp-3	cova	active	2024-09-01	\N	female	https://i.pravatar.cc/150?u=ayse	Ayşe	Kaya	Factory Worker	Production	2024-09-01 00:00:00	2024-09-01 00:00:00	user-1
emp-4	wp-4	cova	active	2024-11-10	\N	female	https://i.pravatar.cc/150?u=fatma	Fatma	Şahin	Food Processor	Production	2024-11-10 00:00:00	2024-11-10 00:00:00	user-1
emp-5	wp-5	cova	former	2024-01-20	2024-10-31	male	https://i.pravatar.cc/150?u=ali	Ali	Öztürk	Logistics Coordinator	Logistics	2024-01-20 00:00:00	2024-10-31 00:00:00	user-1
emp-6	wp-6	cova	active	2024-05-10	\N	female	https://i.pravatar.cc/150?u=emma	Emma	Wilson	Customer Service	Administration	2024-05-10 00:00:00	2024-05-10 00:00:00	user-1
emp-7	wp-7	cova	active	2024-03-15	\N	male	https://i.pravatar.cc/150?u=tom	Tom	Müller	Warehouse Supervisor	Logistics	2024-03-15 00:00:00	2024-03-15 00:00:00	user-1
emp-8	wp-8	cova	active	2024-04-20	\N	female	https://i.pravatar.cc/150?u=lisa	Lisa	Schmidt	Quality Inspector	Production	2024-04-20 00:00:00	2024-04-20 00:00:00	user-1
emp-9	wp-9	cova	active	2024-02-28	\N	male	https://i.pravatar.cc/150?u=paul	Paul	Anderson	Maintenance Tech	Facility Management	2024-02-28 00:00:00	2024-02-28 00:00:00	user-1
emp-10	wp-10	cova	active	2024-06-01	\N	female	https://i.pravatar.cc/150?u=anna	Anna	Kowalski	Admin Assistant	Administration	2024-06-01 00:00:00	2024-06-01 00:00:00	user-1
emp-11	wp-11	cova	active	2024-01-10	\N	male	https://i.pravatar.cc/150?u=klaus	Klaus	Wagner	Production Manager	Production	2024-01-10 00:00:00	2024-01-10 00:00:00	user-1
emp-12	wp-12	cova	active	2024-07-05	\N	male	https://i.pravatar.cc/150?u=mustafa	Mustafa	Yıldırım	Packaging Specialist	Production	2024-07-05 00:00:00	2024-07-05 00:00:00	user-1
\.


--
-- Data for Name: houses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.houses (id, tenant_id, name, address, house_number, house_number_addition, postal_code, city, country, latitude, longitude, total_rooms, total_beds, cost_per_week, cost_per_bed_per_day, ownership_type, status, description, internal_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: platform_admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_admins (id, email, password, first_name, last_name, role, last_login_at, created_at, updated_at) FROM stdin;
platform-admin-1	tahir@arpdo.com	$2b$10$u4sWHn3bMnlABUZYUgTMueiodv/FCOIS2Zsq4ndM82CORfyIEFOYi	Tahir	Çetin	super_admin	\N	2024-01-01 00:00:00	2024-01-01 00:00:00
platform-admin-2	admin@arpdo.com	$2b$10$zvf1NaDn8ehyDQ5mOyMTzuU8Olb0pWE.2xTVSnie0pEN1AejxljI6	Platform	Admin	admin	\N	2024-01-15 00:00:00	2024-01-15 00:00:00
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservations (id, employment_id, house_id, room_id, bed_id, tenant_id, start_date, end_date, check_in_date, check_out_date, status, daily_rate, total_cost, on_vacation, belongings_in_room, description, internal_notes, confirmed_by, confirmed_at, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, house_id, room_number, floor, room_type, bed_count, gender_restriction, is_family_room, status, cost_per_day, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, name, slug, type, status, contact_email, contact_phone, plan, trial_ends_at, subscription_starts_at, modules, currency, favorite_countries, default_country, created_at, updated_at, created_by) FROM stdin;
tenant-cova	Cova B.V.	cova-bv	staffing_agency	active	info@cova.nl	+31 40 1234567	professional	\N	2024-01-15 00:00:00	"{\\"workers\\":true,\\"planning\\":true,\\"accommodation\\":true,\\"transport\\":false,\\"finance\\":false}"	EUR	{DE,NL,TR,PL,FR,BE}	NL	2024-01-15 00:00:00	2024-01-15 00:00:00	platform-admin-1
tenant-apple	Apple Netherlands	apple-nl	direct_employer	trial	hr@apple.nl	+31 20 1234567	enterprise	2025-11-01 19:06:45.504	\N	"{\\"workers\\":true,\\"planning\\":true,\\"accommodation\\":false,\\"transport\\":true,\\"finance\\":true}"	EUR	{NL,GB,US}	NL	2024-10-01 00:00:00	2024-10-01 00:00:00	platform-admin-1
tenant-oneflex	OneFlex B.V.	oneflex	staffing_agency	active	contact@oneflex.nl	+31 20 9876543	professional	\N	2024-06-01 00:00:00	"{\\"workers\\":true,\\"planning\\":true,\\"accommodation\\":true,\\"transport\\":true,\\"finance\\":false}"	EUR	{NL,DE,BE}	NL	2024-06-01 00:00:00	2024-06-01 00:00:00	platform-admin-1
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
user-cova-fatma	tenant-cova	fatma.yilmaz@gmail.com	$2b$10$M8AKjnGHXV9u6d/gtoUgbOxtQnzbqDXSKlkvyRbcCD.SNCFajKoAy	Fatma	Yılmaz	{planner,finance}	active	2024-03-01 00:00:00	user-cova-owner	2024-03-01 00:00:00	\N	2024-10-18 00:00:00	2024-03-01 00:00:00	2024-10-18 00:00:00
user-apple-owner	tenant-apple	tim@apple.nl	$2b$10$4vd9MwrRn9AWgM7sWyDWKOEjmopbqizhluYTIJb1HeZBJ3FYJc.xe	Tim	Cook	{owner}	active	2024-10-01 00:00:00	platform-admin-1	2024-10-01 00:00:00	\N	2024-10-18 00:00:00	2024-10-01 00:00:00	2024-10-18 00:00:00
user-apple-fatma	tenant-apple	fatma.yilmaz@gmail.com	$2b$10$M8AKjnGHXV9u6d/gtoUgbOxtQnzbqDXSKlkvyRbcCD.SNCFajKoAy	Fatma	Yılmaz	{hr_manager}	active	2024-10-05 00:00:00	user-apple-owner	2024-10-05 00:00:00	\N	2024-10-17 00:00:00	2024-10-05 00:00:00	2024-10-17 00:00:00
user-oneflex-owner	tenant-oneflex	sophie@oneflex.nl	$2b$10$SX49cSlGk/7lsJmdraD4c.NvCcTPUEkPPoJaX0vfW62gO.wIWIBAu	Sophie	van der Berg	{owner}	active	2024-06-01 00:00:00	platform-admin-1	2024-06-01 00:00:00	\N	2024-10-16 00:00:00	2024-06-01 00:00:00	2024-10-16 00:00:00
user-oneflex-pending	tenant-oneflex	mark@oneflex.nl	\N	Mark	Peters	{viewer}	invited	2024-10-10 00:00:00	user-oneflex-owner	\N	invite_token_abc123	\N	2024-10-10 00:00:00	2024-10-10 00:00:00
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
-- Name: beds beds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beds
    ADD CONSTRAINT beds_pkey PRIMARY KEY (id);


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

