
-- Proposed PostgreSQL reference; app assigns UUIDs. Not applied to any live DB.
BEGIN;
CREATE TABLE users (
 id uuid PRIMARY KEY, identity_subject text NOT NULL UNIQUE,
 display_name text NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 100),
 timezone text NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
 attention_lead_days integer NOT NULL DEFAULT 2 CHECK(attention_lead_days BETWEEN 0 AND 30),
 version integer NOT NULL DEFAULT 1 CHECK(version>=1),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE food_entries (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 name varchar(200) NOT NULL CHECK(length(trim(name))>0),
 storage_location varchar(100) NOT NULL DEFAULT 'unspecified' CHECK(length(trim(storage_location))>0),
 remaining_quantity numeric(12,3) NOT NULL CHECK(remaining_quantity>=0),
 unit varchar(10) NOT NULL CHECK(unit IN ('piece','g','ml')),
 expiry_date date,
 date_certainty varchar(12) NOT NULL DEFAULT 'unknown' CHECK(date_certainty IN ('known','estimated','unknown')),
 date_source varchar(20) NOT NULL DEFAULT 'unknown' CHECK(date_source IN ('printed_label','user_entered','user_estimate','unknown')),
 date_label_type varchar(15) NOT NULL DEFAULT 'unspecified' CHECK(date_label_type IN ('use_by','best_before','unspecified')),
 opened_on date, note text CHECK(length(note)<=1000),
 version integer NOT NULL DEFAULT 1 CHECK(version>=1), deleted_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(unit <> 'piece' OR remaining_quantity=trunc(remaining_quantity)),
 CHECK((date_certainty='unknown' AND expiry_date IS NULL AND date_source='unknown' AND date_label_type='unspecified')
 OR (date_certainty='estimated' AND expiry_date IS NOT NULL AND date_source='user_estimate')
 OR (date_certainty='known' AND expiry_date IS NOT NULL AND date_source IN ('printed_label','user_entered')))
);
CREATE TABLE stock_movements (
 id uuid PRIMARY KEY, entry_id uuid NOT NULL REFERENCES food_entries(id) ON DELETE RESTRICT,
 kind varchar(12) NOT NULL CHECK(kind IN ('initial','consume','discard','adjustment')),
 quantity_before numeric(12,3) NOT NULL CHECK(quantity_before>=0),
 quantity_after numeric(12,3) NOT NULL CHECK(quantity_after>=0),
 reason text CHECK(length(reason)<=500), recorded_at timestamptz NOT NULL DEFAULT now(),
 CHECK((kind='initial' AND quantity_before=0 AND quantity_after>0)
 OR (kind IN ('consume','discard') AND quantity_after<quantity_before)
 OR (kind='adjustment' AND quantity_after<>quantity_before AND reason IS NOT NULL AND length(trim(reason))>0))
);
CREATE UNIQUE INDEX one_initial_per_entry ON stock_movements(entry_id) WHERE kind='initial';
CREATE INDEX entries_owner_visible ON food_entries(user_id,expiry_date,id) WHERE deleted_at IS NULL AND remaining_quantity>0;
CREATE INDEX entries_owner_trash ON food_entries(user_id,deleted_at DESC,id) WHERE deleted_at IS NOT NULL;
CREATE INDEX movements_entry_history ON stock_movements(entry_id,recorded_at DESC,id);
CREATE TABLE api_requests (
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 idempotency_key varchar(100) NOT NULL CHECK(idempotency_key ~ '^[A-Za-z0-9_-]{8,100}$'),
 operation text NOT NULL, request_hash text NOT NULL,
 response_status integer CHECK(response_status BETWEEN 200 AND 299), response_body jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,idempotency_key),
 CHECK((response_status IS NULL AND response_body IS NULL) OR (response_status IS NOT NULL AND response_body IS NOT NULL))
);
-- 204 success stores response_body as JSON null ('null'::jsonb), not SQL NULL.
-- Services must complete or rollback key reservations before commit.
-- Validate decimal scale/range before INSERT: numeric(12,3) itself can round excessive scale.
-- Owner scoping and cross-row ledger sum cannot be enforced by these CHECKs alone.
COMMIT;
