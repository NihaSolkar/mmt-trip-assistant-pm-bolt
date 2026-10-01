/*
# Seed Catalogue Data

Populates stays, activities, food_costs, and transport_costs for
Gokarna, Shirdi, and Nashik with realistic Indian pricing.
*/

-- ============ STAYS ============
INSERT INTO stays (destination, name, type, price_per_night, vibe, rating, distance_to_hub_km, has_lift, ground_floor_only, pure_veg_nearby, curfew, verified_offbeat) VALUES
-- Gokarna
('Gokarna', 'Namaste Yoga Hostel', 'hostel', 450, 'Acoustic beach vibes', 4.6, 0.5, false, false, false, 'none', true),
('Gokarna', 'Shanti Guesthouse Homestay', 'homestay', 800, 'Family-run, peaceful', 4.4, 1.2, false, true, false, 'none', true),
('Gokarna', 'Gokarna Beach Retreat', 'homestay', 650, 'Rustic sea-front', 4.2, 0.3, false, true, false, 'none', true),
('Gokarna', 'Zostel Gokarna', 'hostel', 550, 'Social backpacker', 4.5, 0.8, false, false, false, 'none', true),
('Gokarna', 'Om Beach Resort', 'resort', 2200, 'Beachfront comfort', 4.3, 0.2, true, false, false, 'none', false),
('Gokarna', 'Hotel Mahabaleshwar', 'hotel', 1500, 'Temple-town classic', 4.0, 0.1, true, false, true, '22:00', false),
-- Shirdi
('Shirdi', 'Sai Pilgrim Homestay', 'homestay', 700, 'Devotional, quiet', 4.5, 0.5, false, true, true, 'none', true),
('Shirdi', 'Shirdi Sai Ashram Lodge', 'homestay', 600, 'Simple pilgrim stay', 4.2, 0.8, false, true, true, 'none', true),
('Shirdi', 'Hotel Sai Sahavas', 'hotel', 1800, 'Comfort near temple', 4.4, 0.3, true, false, true, 'none', false),
('Shirdi', 'Sun N Sand Shirdi', 'resort', 3500, 'Premium pilgrim comfort', 4.6, 1.5, true, false, true, 'none', false),
('Shirdi', 'Bhakti Niwas Guesthouse', 'homestay', 500, 'Budget pilgrim, ground floor', 4.0, 0.6, false, true, true, 'none', true),
-- Nashik
('Nashik', 'Vineyard Homestay Nashik', 'homestay', 900, 'Wine-country rustic', 4.5, 3.0, false, true, false, 'none', true),
('Nashik', 'Godavari Heritage Homestay', 'homestay', 750, 'Riverside heritage', 4.3, 1.0, false, true, true, 'none', true),
('Nashik', 'Hotel Ginger Nashik', 'hotel', 2000, 'Modern business comfort', 4.3, 2.5, true, false, true, 'none', false),
('Nashik', 'Sula Vineyards Resort', 'resort', 4000, 'Vineyard luxury', 4.7, 8.0, true, false, false, 'none', false),
('Nashik', 'Panchavati Pilgrim Lodge', 'homestay', 550, 'Temple-area budget', 4.0, 0.4, false, true, true, 'none', true)
ON CONFLICT DO NOTHING;

-- ============ ACTIVITIES ============
INSERT INTO activities (destination, name, category, price_per_person, duration_hours, senior_friendly, pure_veg_nearby) VALUES
-- Gokarna
('Gokarna', 'Kudle Beach Sunset Walk', 'beach', 0, 2, true, false),
('Gokarna', 'Om Beach Trek', 'adventure', 0, 3, false, false),
('Gokarna', 'Half Moon Beach Visit', 'beach', 0, 2, true, false),
('Gokarna', 'Shiva Temple Darshan', 'temple', 0, 1, true, true),
('Gokarna', 'Beach Bonfire & Acoustic Jam', 'nature', 200, 3, false, false),
('Gokarna', 'Paragliding at Gokarna', 'adventure', 1500, 1, false, false),
('Gokarna', 'Mirjan Fort Visit', 'sightseeing', 0, 2, true, false),
-- Shirdi
('Shirdi', 'Sai Baba Temple Darshan', 'temple', 0, 2, true, true),
('Shirdi', 'Dwarkamai Visit', 'temple', 0, 1, true, true),
('Shirdi', 'Chavadi Visit', 'temple', 0, 1, true, true),
('Shirdi', 'Shani Shingnapur Day Trip', 'sightseeing', 300, 4, true, true),
('Shirdi', 'Lendi Baug Walk', 'nature', 0, 1, true, true),
-- Nashik
('Nashik', 'Trimbakeshwar Temple Darshan', 'temple', 0, 2, true, true),
('Nashik', 'Sula Vineyard Tour & Tasting', 'sightseeing', 800, 3, true, false),
('Nashik', 'Panchavati Temple Circuit', 'temple', 0, 3, true, true),
('Nashik', 'Godavari Aarti at Ramkund', 'temple', 0, 1, true, true),
('Nashik', 'Saptashrungi Devi Temple Trip', 'sightseeing', 400, 5, false, true),
('Nashik', 'Anjaneri Hills Trek', 'adventure', 0, 4, false, false)
ON CONFLICT DO NOTHING;

-- ============ FOOD_COSTS ============
INSERT INTO food_costs (destination, meal, price_per_person, pure_veg) VALUES
('Gokarna', 'breakfast', 120, false),
('Gokarna', 'lunch', 200, false),
('Gokarna', 'dinner', 250, false),
('Gokarna', 'breakfast', 100, true),
('Gokarna', 'lunch', 180, true),
('Gokarna', 'dinner', 220, true),
('Shirdi', 'breakfast', 80, true),
('Shirdi', 'lunch', 150, true),
('Shirdi', 'dinner', 180, true),
('Nashik', 'breakfast', 100, true),
('Nashik', 'lunch', 180, true),
('Nashik', 'dinner', 220, true),
('Nashik', 'breakfast', 120, false),
('Nashik', 'lunch', 200, false),
('Nashik', 'dinner', 250, false)
ON CONFLICT DO NOTHING;

-- ============ TRANSPORT_COSTS ============
INSERT INTO transport_costs (route, mode, price_per_person) VALUES
('Bangalore-Gokarna', 'bus', 650),
('Bangalore-Gokarna', 'train', 500),
('Bangalore-Gokarna', 'cab', 1800),
('Mumbai-Gokarna', 'bus', 800),
('Mumbai-Gokarna', 'train', 600),
('Mumbai-Shirdi', 'bus', 500),
('Mumbai-Shirdi', 'train', 400),
('Mumbai-Shirdi', 'cab', 1500),
('Mumbai-Nashik', 'bus', 400),
('Mumbai-Nashik', 'train', 350),
('Mumbai-Nashik', 'cab', 1200),
('Shirdi-Nashik', 'bus', 250),
('Shirdi-Nashik', 'train', 200),
('Shirdi-Nashik', 'cab', 800),
('Pune-Shirdi', 'bus', 450),
('Pune-Shirdi', 'train', 350),
('Pune-Nashik', 'bus', 400),
('Pune-Nashik', 'train', 300)
ON CONFLICT DO NOTHING;