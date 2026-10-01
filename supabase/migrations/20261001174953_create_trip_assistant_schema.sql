/*
# MakeMyTrip TripAssistant AI — Core Schema

## Overview
Creates the full schema for the TripAssistant AI app: user profiles, itineraries,
and supporting catalogue tables (stays, activities, food costs, transport costs)
with seed data for Gokarna, Shirdi, and Nashik.

## New Tables

1. **profiles**
   - `id` (uuid, PK, references auth.users) — one row per user
   - `email` (text) — cached email for display
   - `profile_type` (text) — 'friends' or 'senior_pilgrim'; null until onboarding
   - `created_at` (timestamptz)

2. **itineraries**
   - `id` (uuid, PK)
   - `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users)
   - `destination` (text)
   - `start_date` (date)
   - `end_date` (date)
   - `party_size` (int)
   - `per_person_budget` (numeric) — user's stated per-person budget in INR
   - `profile_type` (text) — which persona generated this trip
   - `trip_data` (jsonb) — full day-by-day itinerary payload
   - `review_status` (text, default 'draft') — draft / saved / reviewed
   - `created_at` (timestamptz)

3. **stays** (catalogue)
   - `id` (uuid, PK)
   - `destination` (text) — e.g. 'Gokarna'
   - `name` (text)
   - `type` (text) — 'hostel' | 'homestay' | 'hotel' | 'resort'
   - `price_per_night` (numeric)
   - `vibe` (text) — short vibe tag
   - `rating` (numeric)
   - `distance_to_hub_km` (numeric)
   - `has_lift` (boolean)
   - `ground_floor_only` (boolean)
   - `pure_veg_nearby` (boolean)
   - `curfew` (text) — e.g. 'none' or '22:00'
   - `verified_offbeat` (boolean) — true for hostels/homestays

4. **activities** (catalogue)
   - `id` (uuid, PK)
   - `destination` (text)
   - `name` (text)
   - `category` (text) — 'beach' | 'temple' | 'adventure' | 'sightseeing' | 'nature'
   - `price_per_person` (numeric)
   - `duration_hours` (numeric)
   - `senior_friendly` (boolean)
   - `pure_veg_nearby` (boolean)

5. **food_costs** (catalogue)
   - `id` (uuid, PK)
   - `destination` (text)
   - `meal` (text) — 'breakfast' | 'lunch' | 'dinner'
   - `price_per_person` (numeric)
   - `pure_veg` (boolean)

6. **transport_costs** (catalogue)
   - `id` (uuid, PK)
   - `route` (text) — e.g. 'Bangalore-Gokarna'
   - `mode` (text) — 'bus' | 'train' | 'cab'
   - `price_per_person` (numeric)

## Security
- RLS enabled on all tables.
- profiles: owner-scoped CRUD (authenticated, auth.uid() = id).
- itineraries: owner-scoped CRUD (authenticated, auth.uid() = user_id).
- Catalogue tables (stays, activities, food_costs, transport_costs): read-only
  for authenticated users (SELECT only, no insert/update/delete).
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  profile_type text CHECK (profile_type IN ('friends', 'senior_pilgrim')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============ ITINERARIES ============
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination text NOT NULL,
  start_date date,
  end_date date,
  party_size int DEFAULT 1,
  per_person_budget numeric,
  profile_type text,
  trip_data jsonb,
  review_status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_itineraries" ON itineraries;
CREATE POLICY "select_own_itineraries" ON itineraries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_itineraries" ON itineraries;
CREATE POLICY "insert_own_itineraries" ON itineraries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_itineraries" ON itineraries;
CREATE POLICY "update_own_itineraries" ON itineraries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_itineraries" ON itineraries;
CREATE POLICY "delete_own_itineraries" ON itineraries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ STAYS (catalogue) ============
CREATE TABLE IF NOT EXISTS stays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  price_per_night numeric NOT NULL,
  vibe text,
  rating numeric DEFAULT 0,
  distance_to_hub_km numeric DEFAULT 0,
  has_lift boolean DEFAULT false,
  ground_floor_only boolean DEFAULT false,
  pure_veg_nearby boolean DEFAULT false,
  curfew text DEFAULT 'none',
  verified_offbeat boolean DEFAULT false
);

ALTER TABLE stays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_stays" ON stays;
CREATE POLICY "read_stays" ON stays FOR SELECT
  TO authenticated USING (true);

-- ============ ACTIVITIES (catalogue) ============
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  price_per_person numeric NOT NULL,
  duration_hours numeric DEFAULT 2,
  senior_friendly boolean DEFAULT false,
  pure_veg_nearby boolean DEFAULT false
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_activities" ON activities;
CREATE POLICY "read_activities" ON activities FOR SELECT
  TO authenticated USING (true);

-- ============ FOOD_COSTS (catalogue) ============
CREATE TABLE IF NOT EXISTS food_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  meal text NOT NULL,
  price_per_person numeric NOT NULL,
  pure_veg boolean DEFAULT false
);

ALTER TABLE food_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_food_costs" ON food_costs;
CREATE POLICY "read_food_costs" ON food_costs FOR SELECT
  TO authenticated USING (true);

-- ============ TRANSPORT_COSTS (catalogue) ============
CREATE TABLE IF NOT EXISTS transport_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  mode text NOT NULL,
  price_per_person numeric NOT NULL
);

ALTER TABLE transport_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_transport_costs" ON transport_costs;
CREATE POLICY "read_transport_costs" ON transport_costs FOR SELECT
  TO authenticated USING (true);

-- ============ AUTO-CREATE PROFILE TRIGGER ============
-- Creates a profiles row when a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();