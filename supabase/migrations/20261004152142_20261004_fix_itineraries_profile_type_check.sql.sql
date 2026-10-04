/*
# Fix itineraries_profile_type_check constraint

Ensures public.itineraries.profile_type accepts exactly 'friends' and 'senior_pilgrim'.
Drops any existing constraint of that name first to avoid duplicates, then adds the correct one.
No other schema, data, RLS, or trigger changes.
*/

ALTER TABLE public.itineraries DROP CONSTRAINT IF EXISTS itineraries_profile_type_check;

ALTER TABLE public.itineraries
  ADD CONSTRAINT itineraries_profile_type_check
  CHECK (profile_type = ANY (ARRAY['friends'::text, 'senior_pilgrim'::text]));
