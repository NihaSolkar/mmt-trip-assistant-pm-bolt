import type { Stay, Activity, FoodCost, TransportCost } from '@/types';
import { getOccupancy } from '@/lib/ranking';

// Occupancy assumption: hostel = 1 person per pricing unit;
// homestay/cottage = min(party size, 3);
// chain hotel = 2 people per room.

export interface BudgetContext {
  stay: Stay;
  nights: number;
  partySize: number;
  isSenior: boolean;
  pureVeg: boolean;
}

export interface BudgetResult {
  stayCost: number;
  foodCost: number;
  transportCost: number;
  activityCost: number;
  totalPerPerson: number;
}

export function calcStayCost(ctx: BudgetContext): number {
  const occupancy = getOccupancy(ctx.stay, {
    isSenior: ctx.isSenior,
    pureVeg: ctx.pureVeg,
  });
  const perPersonStayCost =
    (ctx.stay.price_per_night * ctx.nights) / occupancy;
  return perPersonStayCost;
}

export function calcFoodCost(
  foodCosts: FoodCost[],
  _isSenior: boolean,
  days: number,
) {
  if (foodCosts.length === 0) {
    return {
      meals: [],
      totalPerDay: 0,
    };
  }

  const cheapest = [...foodCosts].sort(
    (a, b) =>
      a.cost_per_person_per_day - b.cost_per_person_per_day,
  )[0];

  const totalPerDay = Number(cheapest.cost_per_person_per_day) || 0;

  return {
    meals: [
      {
        meal: cheapest.daily_food_band || 'Daily food',
        cost: totalPerDay,
      },
    ],
    totalPerDay,
  };
}

export function calcTransportCost(
  transport: TransportCost[],
): { route: string; mode: string; cost: number } | null {
  if (transport.length === 0) return null;
  const cheapest = [...transport].sort(
    (a, b) => a.price_per_person - b.price_per_person,
  )[0];
  return {
    route: cheapest.route,
    mode: cheapest.mode,
    cost: cheapest.price_per_person,
  };
}

export function calcActivityCost(activities: Activity[]): number {
  return activities.reduce((sum, a) => sum + a.price_per_person, 0);
}

export function calcTotalPerPerson(
  stayCost: number,
  foodCost: number,
  transportCost: number,
  activityCost: number,
): number {
  return stayCost + foodCost + transportCost + activityCost;
}

export interface ShortfallResult {
  shortfall: number | null;
  minimumViableBudget: number | null;
  feasible: boolean;
}

export function calcShortfall(
  totalPerPerson: number,
  budgetPerPerson: number,
): ShortfallResult {
  if (totalPerPerson <= budgetPerPerson) {
    return { shortfall: null, minimumViableBudget: null, feasible: true };
  }
  return {
    shortfall: totalPerPerson - budgetPerPerson,
    minimumViableBudget: Math.ceil(totalPerPerson / 100) * 100,
    feasible: false,
  };
}

export interface MinimumViableBudgetInput {
  stays: Stay[];
  foodCosts: FoodCost[];
  transportCosts: TransportCost[];
  activities: Activity[];
  nights: number;
  partySize: number;
  isSenior: boolean;
  pureVeg: boolean;
}

export function calcMinimumViableBudget(
  input: MinimumViableBudgetInput,
): number | null {
  const qualifyingStays = input.isSenior
    ? input.stays.filter(
        (s) => s.has_lift === true || s.ground_floor_only === true,
      )
    : input.stays;

  if (qualifyingStays.length === 0) return null;

  const cheapestStay = [...qualifyingStays].sort(
    (a, b) => a.price_per_night - b.price_per_night,
  )[0];

  const stayCost = calcStayCost({
    stay: cheapestStay,
    nights: input.nights,
    partySize: input.partySize,
    isSenior: input.isSenior,
    pureVeg: input.pureVeg,
  });

  const foodOptions = input.isSenior
    ? input.foodCosts.filter((f) => f.pure_veg === true)
    : input.foodCosts;

  if (foodOptions.length === 0 && input.isSenior) return null;

  const dailyFood = foodOptions.length > 0
    ? Math.min(...foodOptions.map((f) => f.price_per_person)) * 3
    : 0;

  const transportCost =
    input.transportCosts.length > 0
      ? Math.min(...input.transportCosts.map((t) => t.price_per_person))
      : 0;

  const qualifyingActivities = input.isSenior
    ? input.activities.filter((a) => a.senior_friendly === true)
    : input.activities;

  const activityCost =
    qualifyingActivities.length > 0
      ? Math.min(
          ...qualifyingActivities.map((a) => a.price_per_person),
        )
      : 0;

  const total = stayCost + dailyFood + transportCost + activityCost;
  return Math.ceil(total / 100) * 100;
}
