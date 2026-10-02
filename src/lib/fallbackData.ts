import type { Stay, Activity, FoodCost, TransportCost } from '@/types';

export const fallbackStays: Stay[] = [
  { id: 'f1', destination: 'Gokarna', name: 'Namaste Yoga Hostel', type: 'hostel', price_per_night: 450, vibe: 'Acoustic beach vibes', rating: 4.6, distance_to_hub_km: 0.5, has_lift: false, ground_floor_only: false, pure_veg_nearby: false, curfew: 'none', verified_offbeat: true },
  { id: 'f2', destination: 'Gokarna', name: 'Shanti Guesthouse Homestay', type: 'homestay', price_per_night: 800, vibe: 'Family-run, peaceful', rating: 4.4, distance_to_hub_km: 1.2, has_lift: false, ground_floor_only: true, pure_veg_nearby: false, curfew: 'none', verified_offbeat: true },
  { id: 'f3', destination: 'Gokarna', name: 'Zostel Gokarna', type: 'hostel', price_per_night: 550, vibe: 'Social backpacker', rating: 4.5, distance_to_hub_km: 0.8, has_lift: false, ground_floor_only: false, pure_veg_nearby: false, curfew: 'none', verified_offbeat: true },
  { id: 'f4', destination: 'Gokarna', name: 'Om Beach Resort', type: 'resort', price_per_night: 2200, vibe: 'Beachfront comfort', rating: 4.3, distance_to_hub_km: 0.2, has_lift: true, ground_floor_only: false, pure_veg_nearby: false, curfew: 'none', verified_offbeat: false },
  { id: 'f5', destination: 'Shirdi', name: 'Sai Pilgrim Homestay', type: 'homestay', price_per_night: 700, vibe: 'Devotional, quiet', rating: 4.5, distance_to_hub_km: 0.5, has_lift: false, ground_floor_only: true, pure_veg_nearby: true, curfew: 'none', verified_offbeat: true },
  { id: 'f6', destination: 'Shirdi', name: 'Bhakti Niwas Guesthouse', type: 'homestay', price_per_night: 500, vibe: 'Budget pilgrim, ground floor', rating: 4.0, distance_to_hub_km: 0.6, has_lift: false, ground_floor_only: true, pure_veg_nearby: true, curfew: 'none', verified_offbeat: true },
  { id: 'f7', destination: 'Shirdi', name: 'Hotel Sai Sahavas', type: 'hotel', price_per_night: 1800, vibe: 'Comfort near temple', rating: 4.4, distance_to_hub_km: 0.3, has_lift: true, ground_floor_only: false, pure_veg_nearby: true, curfew: 'none', verified_offbeat: false },
  { id: 'f8', destination: 'Nashik', name: 'Vineyard Homestay Nashik', type: 'homestay', price_per_night: 900, vibe: 'Wine-country rustic', rating: 4.5, distance_to_hub_km: 3.0, has_lift: false, ground_floor_only: true, pure_veg_nearby: false, curfew: 'none', verified_offbeat: true },
  { id: 'f9', destination: 'Nashik', name: 'Godavari Heritage Homestay', type: 'homestay', price_per_night: 750, vibe: 'Riverside heritage', rating: 4.3, distance_to_hub_km: 1.0, has_lift: false, ground_floor_only: true, pure_veg_nearby: true, curfew: 'none', verified_offbeat: true },
  { id: 'f10', destination: 'Nashik', name: 'Panchavati Pilgrim Lodge', type: 'homestay', price_per_night: 550, vibe: 'Temple-area budget', rating: 4.0, distance_to_hub_km: 0.4, has_lift: false, ground_floor_only: true, pure_veg_nearby: true, curfew: 'none', verified_offbeat: true },
];

export const fallbackActivities: Activity[] = [
  { id: 'a1', destination: 'Gokarna', name: 'Kudle Beach Sunset Walk', category: 'beach', price_per_person: 0, duration_hours: 2, senior_friendly: true, pure_veg_nearby: false },
  { id: 'a2', destination: 'Gokarna', name: 'Om Beach Trek', category: 'adventure', price_per_person: 0, duration_hours: 3, senior_friendly: false, pure_veg_nearby: false },
  { id: 'a3', destination: 'Gokarna', name: 'Shiva Temple Darshan', category: 'temple', price_per_person: 0, duration_hours: 1, senior_friendly: true, pure_veg_nearby: true },
  { id: 'a4', destination: 'Gokarna', name: 'Beach Bonfire & Acoustic Jam', category: 'nature', price_per_person: 200, duration_hours: 3, senior_friendly: false, pure_veg_nearby: false },
  { id: 'a5', destination: 'Shirdi', name: 'Sai Baba Temple Darshan', category: 'temple', price_per_person: 0, duration_hours: 2, senior_friendly: true, pure_veg_nearby: true },
  { id: 'a6', destination: 'Shirdi', name: 'Dwarkamai Visit', category: 'temple', price_per_person: 0, duration_hours: 1, senior_friendly: true, pure_veg_nearby: true },
  { id: 'a7', destination: 'Shirdi', name: 'Lendi Baug Walk', category: 'nature', price_per_person: 0, duration_hours: 1, senior_friendly: true, pure_veg_nearby: true },
  { id: 'a8', destination: 'Nashik', name: 'Trimbakeshwar Temple Darshan', category: 'temple', price_per_person: 0, duration_hours: 2, senior_friendly: true, pure_veg_nearby: true },
  { id: 'a9', destination: 'Nashik', name: 'Panchavati Temple Circuit', category: 'temple', price_per_person: 0, duration_hours: 3, senior_friendly: true, pure_veg_nearby: true },
  { id: 'a10', destination: 'Nashik', name: 'Godavari Aarti at Ramkund', category: 'temple', price_per_person: 0, duration_hours: 1, senior_friendly: true, pure_veg_nearby: true },
];

export const fallbackFoodCosts: FoodCost[] = [
  { id: 'fc1', destination: 'Gokarna', daily_food_band: 'Breakfast', cost_per_person_per_day: 100 },
  { id: 'fc2', destination: 'Gokarna', daily_food_band: 'Lunch', cost_per_person_per_day: 180 },
  { id: 'fc3', destination: 'Gokarna', daily_food_band: 'Dinner', cost_per_person_per_day: 220 },
  { id: 'fc4', destination: 'Shirdi', daily_food_band: 'Daily meals', cost_per_person_per_day: 180 },
  { id: 'fc5', destination: 'Nashik', daily_food_band: 'Daily meals', cost_per_person_per_day: 220 },
];

export const fallbackTransportCosts: TransportCost[] = [
  { id: 't1', route: 'Bangalore-Gokarna', mode: 'bus', price_per_person: 650 },
  { id: 't2', route: 'Bangalore-Gokarna', mode: 'train', price_per_person: 500 },
  { id: 't3', route: 'Mumbai-Shirdi', mode: 'bus', price_per_person: 500 },
  { id: 't4', route: 'Mumbai-Shirdi', mode: 'train', price_per_person: 400 },
  { id: 't5', route: 'Mumbai-Nashik', mode: 'bus', price_per_person: 400 },
  { id: 't6', route: 'Mumbai-Nashik', mode: 'train', price_per_person: 350 },
  { id: 't7', route: 'Shirdi-Nashik', mode: 'bus', price_per_person: 250 },
  { id: 't8', route: 'Shirdi-Nashik', mode: 'train', price_per_person: 200 },
];

export const fallbackCatalogue = {
  stays: fallbackStays,
  activities: fallbackActivities,
  foodCosts: fallbackFoodCosts,
  transportCosts: fallbackTransportCosts,
};
