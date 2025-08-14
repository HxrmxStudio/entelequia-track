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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    line1 character varying NOT NULL,
    line2 character varying,
    city character varying,
    province_state character varying,
    country character varying DEFAULT 'AR'::character varying NOT NULL,
    postal_code character varying,
    geom public.geography(Point,4326),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: couriers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.couriers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying NOT NULL,
    name character varying NOT NULL,
    user_id uuid,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    phone character varying,
    email character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_key character varying NOT NULL,
    subject_id uuid NOT NULL,
    actor_kind character varying,
    actor_id uuid,
    payload jsonb DEFAULT '{}'::jsonb,
    occurred_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: imports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    created_by uuid,
    rows_total integer DEFAULT 0,
    rows_valid integer DEFAULT 0,
    rows_invalid integer DEFAULT 0,
    checksum character varying,
    error_report_url text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    courier_id uuid NOT NULL,
    recorded_at timestamp(6) without time zone NOT NULL,
    geom public.geography(Point,4326) NOT NULL,
    accuracy_m double precision,
    speed_mps double precision,
    battery_pct integer,
    app_version character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    external_ref character varying,
    customer_id uuid,
    address_id uuid,
    channel character varying DEFAULT 'web'::character varying NOT NULL,
    status character varying DEFAULT 'received'::character varying NOT NULL,
    amount_cents integer DEFAULT 0 NOT NULL,
    currency character varying DEFAULT 'ARS'::character varying NOT NULL,
    delivery_window tstzrange,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proofs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    method character varying NOT NULL,
    photo_url character varying,
    signature_svg text,
    otp_last4 character varying,
    qr_payload_hash character varying,
    geom public.geography(Point,4326),
    captured_at timestamp(6) without time zone NOT NULL,
    device_hash character varying,
    hash_chain character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    photo_key character varying,
    storage_provider character varying DEFAULT 'supabase'::character varying NOT NULL,
    photo_meta jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    courier_id uuid NOT NULL,
    service_date date NOT NULL,
    status character varying DEFAULT 'planned'::character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    assigned_courier_id uuid,
    status character varying DEFAULT 'queued'::character varying NOT NULL,
    delivery_method character varying DEFAULT 'courier'::character varying NOT NULL,
    otp_code_hash character varying,
    qr_token character varying,
    eta timestamp(6) without time zone,
    sla_due_at timestamp(6) without time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    otp_attempts integer DEFAULT 0 NOT NULL,
    otp_locked_until timestamp(6) without time zone,
    geofence_radius_m integer DEFAULT 100 NOT NULL,
    otp_generated_at timestamp(6) without time zone,
    otp_expires_at timestamp(6) without time zone
);


--
-- Name: stops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stops (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    route_id uuid NOT NULL,
    shipment_id uuid NOT NULL,
    sequence integer DEFAULT 0 NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    planned_at timestamp(6) without time zone,
    arrived_at timestamp(6) without time zone,
    completed_at timestamp(6) without time zone,
    notes jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password_digest character varying NOT NULL,
    role character varying DEFAULT 'ops'::character varying NOT NULL,
    name character varying,
    device_hash character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: couriers couriers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.couriers
    ADD CONSTRAINT couriers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: imports imports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imports
    ADD CONSTRAINT imports_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (courier_id, recorded_at);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: proofs proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proofs
    ADD CONSTRAINT proofs_pkey PRIMARY KEY (id);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: stops stops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stops
    ADD CONSTRAINT stops_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: index_addresses_on_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_addresses_on_geom ON public.addresses USING gist (geom);


--
-- Name: index_couriers_on_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_couriers_on_code ON public.couriers USING btree (code);


--
-- Name: index_couriers_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_couriers_on_user_id ON public.couriers USING btree (user_id);


--
-- Name: index_customers_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_customers_on_email ON public.customers USING btree (email);


--
-- Name: index_events_on_occurred_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_occurred_at ON public.events USING btree (occurred_at);


--
-- Name: index_events_on_payload; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_payload ON public.events USING gin (payload);


--
-- Name: index_events_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_subject_id ON public.events USING btree (subject_id);


--
-- Name: index_events_on_type_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_type_key ON public.events USING btree (type_key);


--
-- Name: index_imports_on_checksum; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_imports_on_checksum ON public.imports USING btree (checksum);


--
-- Name: index_imports_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_imports_on_status ON public.imports USING btree (status);


--
-- Name: index_locations_on_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_locations_on_geom ON public.locations USING gist (geom);


--
-- Name: index_orders_on_channel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_orders_on_channel ON public.orders USING btree (channel);


--
-- Name: index_orders_on_external_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_orders_on_external_ref ON public.orders USING btree (external_ref);


--
-- Name: index_orders_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_orders_on_status ON public.orders USING btree (status);


--
-- Name: index_proofs_on_geom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proofs_on_geom ON public.proofs USING gist (geom);


--
-- Name: index_proofs_on_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proofs_on_method ON public.proofs USING btree (method);


--
-- Name: index_proofs_on_shipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proofs_on_shipment_id ON public.proofs USING btree (shipment_id);


--
-- Name: index_proofs_on_storage_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proofs_on_storage_provider ON public.proofs USING btree (storage_provider);


--
-- Name: index_routes_on_courier_id_and_service_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_routes_on_courier_id_and_service_date ON public.routes USING btree (courier_id, service_date);


--
-- Name: index_shipments_on_assigned_courier_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_shipments_on_assigned_courier_id ON public.shipments USING btree (assigned_courier_id);


--
-- Name: index_shipments_on_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_shipments_on_order_id ON public.shipments USING btree (order_id);


--
-- Name: index_shipments_on_qr_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_shipments_on_qr_token ON public.shipments USING btree (qr_token);


--
-- Name: index_shipments_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_shipments_on_status ON public.shipments USING btree (status);


--
-- Name: index_stops_on_route_id_and_sequence; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_stops_on_route_id_and_sequence ON public.stops USING btree (route_id, sequence);


--
-- Name: index_stops_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_stops_on_status ON public.stops USING btree (status);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_users_on_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_role ON public.users USING btree (role);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20250813195000'),
('20250812104955'),
('20250810171202'),
('20250810171114'),
('20250810152039');

