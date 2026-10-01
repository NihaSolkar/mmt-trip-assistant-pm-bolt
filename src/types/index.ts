export type ProfileType = 'friends' | 'senior_pilgrim';

export interface Profile {
  id: string;
  email: string | null;
  profile_type: ProfileType | null;
  created_at: string;
}

export interface Stay {
  id: string;
  destination: string;
  name: string;
  type: 'hostel' | 'homestay' | 'hotel' | 'resort';
  price_per_night: number;
  vibe: string | null;
  rating: number;
  distance_to_hub_km: number;
  has_lift: boolean;
  ground_floor_only: boolean;
  pure_veg_nearby: boolean;
  curfew: string | null;
  verified_offbeat: boolean;
}

export interface Activity {
  id: string;
  destination: string;
  name: string;
  category: string;
  price_per_person: number;
  duration_hours: number;
  senior_friendly: boolean;
  pure_veg_nearby: boolean;
}

export interface FoodCost {
  id: string;
  destination: string;
  meal: string;
  price_per_person: number;
  pure_veg: boolean;
}

export interface TransportCost {
  id: string;
  route: string;
  mode: string;
  price_per_person: number;
}

export interface Itinerary {
  id: string;
  user_id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  party_size: number;
  per_person_budget: number | null;
  profile_type: string | null;
  trip_data: TripData | null;
  review_status: string;
  created_at: string;
}

export interface DayPlan {
  day: number;
  stay: Stay | null;
  activities: Activity[];
  food: { meal: string; cost: number }[];
  transport: { route: string; mode: string; cost: number } | null;
  perPersonCost: number;
}

export interface TripData {
  days: DayPlan[];
  totalPerPerson: number;
  budgetPerPerson: number;
  shortfall: number | null;
  minimumViableBudget: number | null;
  warnings: string[];
}

export interface TripRequest {
  destination: string;
  days: number;
  partySize: number;
  budgetPerPerson: number;
  vibe?: string;
  pureVeg?: boolean;
  curfew?: string;
  liftRequired?: boolean;
  slowPace?: boolean;
}
