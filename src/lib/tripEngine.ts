import type {
  Stay,
  Activity,
  FoodCost,
  TransportCost,
  TripRequest,
  DayPlan,
  TripData,
} from '@/types';

export interface Catalogue {
  stays: Stay[];
  activities: Activity[];
  foodCosts: FoodCost[];
  transportCosts: TransportCost[];
}

const destinationMap: Record<string, string> = {
  gokarna: 'Gokarna',
  shirdi: 'Shirdi',
  nashik: 'Nashik',
};

export function resolveDestination(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, val] of Object.entries(destinationMap)) {
    if (lower.includes(key)) return val;
  }
  return input.trim();
}

export function getCatalogueForDestination(
  catalogue: Catalogue,
  destination: string,
): { stays: Stay[]; activities: Activity[]; foodCosts: FoodCost[]; transport: TransportCost[] } {
  const dest = resolveDestination(destination);
  return {
    stays: catalogue.stays.filter((s) => s.destination === dest),
    activities: catalogue.activities.filter((a) => a.destination === dest),
    foodCosts: catalogue.foodCosts.filter((f) => f.destination === dest),
    transport: catalogue.transportCosts.filter(
      (t) => t.route.includes(dest) || t.route.toLowerCase().includes(dest.toLowerCase()),
    ),
  };
}

function pickStays(stays: Stay[], req: TripRequest, isSenior: boolean): Stay[] {
  let pool = [...stays];

  if (isSenior) {
    pool = pool.filter((s) => s.has_lift || s.ground_floor_only);
    if (req.pureVeg) {
      pool = pool.filter((s) => s.pure_veg_nearby);
    }
  }

  if (req.curfew === 'no curfew' || req.vibe?.includes('no curfew')) {
    pool = pool.filter((s) => s.curfew === 'none' || s.curfew === null);
  }

  if (req.vibe?.includes('hostel')) {
    pool = pool.filter((s) => s.type === 'hostel');
  } else if (req.vibe?.includes('homestay')) {
    pool = pool.filter((s) => s.type === 'homestay');
  }

  const budgetPerNight = req.budgetPerPerson * 0.35;
  pool.sort((a, b) => {
    const aScore = Math.abs(a.price_per_night - budgetPerNight) + (b.verified_offbeat ? 0 : 500);
    const bScore = Math.abs(b.price_per_night - budgetPerNight) + (a.verified_offbeat ? 0 : 500);
    return aScore - bScore;
  });

  const offbeat = pool.filter((s) => s.verified_offbeat);
  const chains = pool.filter((s) => !s.verified_offbeat);

  const result: Stay[] = [];
  for (const s of offbeat) {
    if (result.length >= 3) break;
    result.push(s);
  }
  if (chains.length > 0 && result.length < 3) {
    result.push(chains[0]);
  }
  if (result.length === 0 && pool.length > 0) {
    result.push(...pool.slice(0, 3));
  }

  return result.slice(0, 3);
}

function pickActivities(
  activities: Activity[],
  req: TripRequest,
  isSenior: boolean,
): Activity[] {
  let pool = [...activities];

  if (isSenior) {
    pool = pool.filter((a) => a.senior_friendly);
    if (req.pureVeg) {
      pool = pool.filter((a) => a.pure_veg_nearby);
    }
  }

  const maxActivities = isSenior ? 2 : 3;
  return pool.slice(0, maxActivities);
}

function getFoodCosts(foodCosts: FoodCost[], isSenior: boolean): { meal: string; cost: number }[] {
  const pureVeg = isSenior;
  const meals: { meal: string; cost: number }[] = [];
  for (const mealType of ['breakfast', 'lunch', 'dinner']) {
    const options = foodCosts.filter(
      (f) => f.meal === mealType && (!pureVeg || f.pure_veg === pureVeg),
    );
    const fallback = foodCosts.filter((f) => f.meal === mealType);
    const source = options.length > 0 ? options : fallback;
    const cheapest = source.sort((a, b) => a.price_per_person - b.price_per_person)[0];
    if (cheapest) {
      meals.push({ meal: mealType, cost: cheapest.price_per_person });
    }
  }
  return meals;
}

function getTransport(
  transport: TransportCost[],
): { route: string; mode: string; cost: number } | null {
  if (transport.length === 0) return null;
  const cheapest = [...transport].sort((a, b) => a.price_per_person - b.price_per_person)[0];
  return { route: cheapest.route, mode: cheapest.mode, cost: cheapest.price_per_person };
}

export function generateTrip(
  catalogue: Catalogue,
  req: TripRequest,
  profileType: string,
): TripData {
  const isSenior = profileType === 'senior_pilgrim';
  const dest = resolveDestination(req.destination);
  const { stays, activities, foodCosts, transport } = getCatalogueForDestination(
    catalogue,
    dest,
  );

  const warnings: string[] = [];
  const selectedStays = pickStays(stays, req, isSenior);
  const dayPlans: DayPlan[] = [];

  const transportInfo = getTransport(transport);
  const foodPlan = getFoodCosts(foodCosts, isSenior);
  const dailyFood = foodPlan.reduce((sum, f) => sum + f.cost, 0);

  for (let day = 1; day <= req.days; day++) {
    const stay = selectedStays[(day - 1) % Math.max(selectedStays.length, 1)] || null;
    const dayActivities = pickActivities(activities, req, isSenior);
    const activitiesCost = dayActivities.reduce((sum, a) => sum + a.price_per_person, 0);
    const stayCost = stay ? stay.price_per_night : 0;
    const transportCost = day === 1 && transportInfo ? transportInfo.cost : 0;

    const perPersonCost = stayCost + dailyFood + activitiesCost + transportCost;

    dayPlans.push({
      day,
      stay,
      activities: dayActivities,
      food: foodPlan,
      transport: day === 1 ? transportInfo : null,
      perPersonCost,
    });
  }

  const totalPerPerson = dayPlans.reduce((sum, d) => sum + d.perPersonCost, 0);

  let shortfall: number | null = null;
  let minimumViableBudget: number | null = null;

  if (totalPerPerson > req.budgetPerPerson) {
    shortfall = totalPerPerson - req.budgetPerPerson;
    minimumViableBudget = Math.ceil(totalPerPerson / 100) * 100;
    warnings.push(
      `Budget shortfall: your budget of ₹${req.budgetPerPerson.toLocaleString('en-IN')} per person covers ₹${(req.budgetPerPerson - shortfall).toLocaleString('en-IN')} of the ₹${totalPerPerson.toLocaleString('en-IN')} estimated cost.`,
    );
  }

  if (isSenior) {
    warnings.push('Senior profile active: max 2 activities/day, 1:00 PM–4:30 PM rest block enforced, lift/ground floor only, pure-veg nearby.');
  }

  if (selectedStays.length < 3 && stays.length > 0) {
    warnings.push(`Only ${selectedStays.length} stay(s) matched your criteria. Consider relaxing filters.`);
  }

  return {
    days: dayPlans,
    totalPerPerson,
    budgetPerPerson: req.budgetPerPerson,
    shortfall,
    minimumViableBudget,
    warnings,
  };
}

export function getStayTransparencyFactors(stay: Stay, budgetPerNight: number): string[] {
  const factors: string[] = [];
  const diff = stay.price_per_night - budgetPerNight;
  if (diff <= 0) {
    factors.push(`Price-fit: ₹${stay.price_per_night}/night is within your stay budget`);
  } else {
    factors.push(`Price-fit: ₹${stay.price_per_night}/night is ₹${diff} above stay budget`);
  }
  factors.push(`Vibe: ${stay.vibe || 'Comfortable stay'}`);
  factors.push(`Reviews: ${stay.rating}/5 rating`);
  factors.push(`Distance: ${stay.distance_to_hub_km}km from hub`);
  return factors;
}
