import type {
  Stay,
  Activity,
  FoodCost,
  TransportCost,
  TripRequest,
  DayPlan,
  TripData,
  ProfileType,
} from '@/types';
import {
  selectTopStays,
  getOccupancy,
  isChainStay,
  isOffbeatStay,
  type RankingContext,
  type RankedStay,
} from '@/lib/ranking';
import {
  calcStayCost,
  calcFoodCost,
  calcTransportCost,
  calcActivityCost,
  calcTotalPerPerson,
  calcShortfall,
  calcMinimumViableBudget,
} from '@/lib/budget';
import { formatINR } from '@/lib/format';

export interface Catalogue {
  stays: Stay[];
  activities: Activity[];
  foodCosts: FoodCost[];
  transportCosts: TransportCost[];
}

export interface PlannerResult {
  tripData: TripData;
}

export interface ScopeValidationResult {
  valid: boolean;
  destination: string | null;
  message: string | null;
  nearestDestination: string | null;
}

const MAX_DAYS = 7;
const MAX_PARTY = 12;

export function validateScope(
  req: TripRequest,
  catalogue: Catalogue,
): ScopeValidationResult {
  if (req.days < 1 || req.days > MAX_DAYS) {
    return {
      valid: false,
      destination: null,
      message: `Trip duration must be between 1 and ${MAX_DAYS} days. You requested ${req.days} days.`,
      nearestDestination: null,
    };
  }

  if (req.partySize < 1 || req.partySize > MAX_PARTY) {
    return {
      valid: false,
      destination: null,
      message: `Party size must be between 1 and ${MAX_PARTY} people. You requested ${req.partySize}.`,
      nearestDestination: null,
    };
  }

  if (req.startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(req.startDate);
    start.setHours(0, 0, 0, 0);
    if (start < today) {
      return {
        valid: false,
        destination: null,
        message: 'Start date cannot be in the past.',
        nearestDestination: null,
      };
    }
  }

  if (req.startDate && req.endDate) {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const diffDays =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays !== req.days) {
      return {
        valid: false,
        destination: null,
        message: `Date range (${diffDays} days) does not match requested trip duration (${req.days} days).`,
        nearestDestination: null,
      };
    }
  }

  const availableDestinations = [
    ...new Set(catalogue.stays.map((s) => s.destination)),
  ];

  const requested = req.destination.toLowerCase().trim();
  const matched = availableDestinations.find(
    (d) => d.toLowerCase() === requested || d.toLowerCase().includes(requested) || requested.includes(d.toLowerCase()),
  );

  if (!matched) {
    const nearest = findNearestDestination(req.destination, availableDestinations);
    return {
      valid: false,
      destination: null,
      message: `Sorry, we don't currently support trips to ${req.destination}. ${
        nearest
          ? `The nearest available destination in our catalogue is ${nearest}.`
          : 'No alternative destinations are available.'
      }`,
      nearestDestination: nearest,
    };
  }

  return {
    valid: true,
    destination: matched,
    message: null,
    nearestDestination: null,
  };
}

function findNearestDestination(
  input: string,
  available: string[],
): string | null {
  if (available.length === 0) return null;
  if (available.length === 1) return available[0];

  const inputLower = input.toLowerCase();
  const commonWords: Record<string, string[]> = {
    gokarna: ['beach', 'coast', 'karnataka', 'sea'],
    shirdi: ['temple', 'pilgrim', 'maharashtra', 'sai'],
    nashik: ['wine', 'vineyard', 'godavari', 'temple'],
  };

  const inputWords = inputLower.split(/[\s,]+/);
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const dest of available) {
    const destLower = dest.toLowerCase();
    let score = 0;
    if (inputLower.includes(destLower) || destLower.includes(inputLower)) {
      score += 100;
    }
    const keywords = commonWords[destLower] || [];
    for (const word of inputWords) {
      if (keywords.some((kw) => word.includes(kw) || kw.includes(word))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = dest;
    }
  }

  return bestMatch || available[0];
}

function tokenizeVibe(vibe: string | undefined): string[] {
  if (!vibe) return [];
  return vibe
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !['a', 'an', 'the', 'and', 'or', 'for', 'per', 'no', 'with'].includes(t));
}

function pickActivities(
  activities: Activity[],
  isSenior: boolean,
  pureVeg: boolean,
): Activity[] {
  let pool = [...activities];

  if (isSenior) {
    pool = pool.filter((a) => a.senior_friendly === true);
    if (pureVeg) {
      pool = pool.filter((a) => a.pure_veg_nearby === true);
    }
  }

  const maxActivities = isSenior ? 2 : 3;
  return pool.slice(0, maxActivities);
}

function buildTransparencyTag(
  stay: Stay,
  intentFit: number,
  targetNightly: number,
): string {
  const factors: string[] = [];

  const occupancy = getOccupancy(stay, {});
  const perPersonNightly = stay.price_per_night / occupancy;
  factors.push(`Price-fit: ${formatINR(stay.price_per_night)}/night`);

  const vibePct = Math.round(intentFit * 100);
  factors.push(`Vibe match: ${vibePct}%`);

  factors.push(
    stay.type.charAt(0).toUpperCase() + stay.type.slice(1),
  );

  factors.push(`${stay.distance_to_hub_km || 0} km from hub`);

  factors.push(`${stay.rating || 0}/5 rating`);

  if (isChainStay(stay) && !isOffbeatStay(stay)) {
    factors.push('Chain hotel');
  }

  return factors.join(' | ');
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function planTrip(
  catalogue: Catalogue,
  req: TripRequest,
  profileType: ProfileType | null,
): TripData {
  const isSenior = (profileType ?? 'friends') === 'senior_pilgrim';
  const pureVeg = isSenior || req.pureVeg === true;
  const nights = Math.max(req.days - 1, 1);

  const scope = validateScope(req, catalogue);

  if (!scope.valid) {
    return {
      days: [],
      totalPerPerson: 0,
      budgetPerPerson: req.budgetPerPerson,
      shortfall: null,
      minimumViableBudget: null,
      warnings: [],
      rejected: true,
      rejectionMessage: scope.message,
      limitedStays: false,
      limitedStaysCount: null,
      aiExplanation: null,
      aiExplanationVisible: false,
    };
  }

  const dest = scope.destination!;
  const destStays = catalogue.stays.filter((s) => s.destination === dest);
  const destActivities = catalogue.activities.filter(
    (a) => a.destination === dest,
  );
  const destFoodCosts = catalogue.foodCosts.filter(
    (f) => f.destination === dest,
  );
  const destTransport = catalogue.transportCosts.filter(
  (t) =>
    typeof t.destination === 'string' &&
    t.destination.toLowerCase().trim() === dest.toLowerCase().trim(),
);

  const warnings: string[] = [];
  const limitedStays = destStays.length < 5;
  if (limitedStays) {
    warnings.push(
      `We found only ${destStays.length} bookable stays in ${dest}.`,
    );
  }

  if (isSenior) {
    const accessibleStays = destStays.filter(
      (s) => s.has_lift === true || s.ground_floor_only === true,
    );
    if (accessibleStays.length === 0) {
      return {
        days: [],
        totalPerPerson: 0,
        budgetPerPerson: req.budgetPerPerson,
        shortfall: null,
        minimumViableBudget: null,
        warnings: [
          `No verified accessible stay (lift or ground floor) is available in ${dest} in the catalogue.`,
        ],
        rejected: true,
        rejectionMessage: `No verified accessible stay is available in ${dest}.`,
        limitedStays: limitedStays,
        limitedStaysCount: destStays.length,
        aiExplanation: null,
        aiExplanationVisible: false,
      };
    }

    if (pureVeg) {
      const vegFood = destFoodCosts.filter((f) => f.pure_veg === true);
      if (vegFood.length === 0) {
        warnings.push(
          `No pure-vegetarian food options found in ${dest} in the catalogue.`,
        );
      }
    }
  }

  const userVibeTags = tokenizeVibe(req.vibe);
  const noCurfew =
    req.curfew === 'no curfew' || (req.vibe?.includes('no curfew') ?? false);

  const rankingCtx: RankingContext = {
    stays: destStays,
    budgetPerPerson: req.budgetPerPerson,
    nights,
    userVibeTags,
    noCurfew,
    isSenior,
    pureVeg,
  };

  const { ranked: rankedStays, warnings: rankingWarnings } =
    selectTopStays(rankingCtx);
  warnings.push(...rankingWarnings);

  if (rankedStays.length === 0) {
    const minBudget = calcMinimumViableBudget({
      stays: destStays,
      foodCosts: destFoodCosts,
      transportCosts: destTransport,
      activities: destActivities,
      nights,
      partySize: req.partySize,
      isSenior,
      pureVeg,
    });

    return {
      days: [],
      totalPerPerson: 0,
      budgetPerPerson: req.budgetPerPerson,
      shortfall: null,
      minimumViableBudget: minBudget,
      warnings,
      rejected: true,
      rejectionMessage: `No qualifying stays found in ${dest} within your budget. ${
        minBudget !== null
          ? `Minimum viable budget: ${formatINR(minBudget)} per person.`
          : 'A minimum viable budget cannot be calculated from the available data.'
      }`,
      limitedStays,
      limitedStaysCount: destStays.length,
      aiExplanation: null,
      aiExplanationVisible: false,
    };
  }

  const foodPlan = calcFoodCost(destFoodCosts, isSenior, req.days);
  const transportInfo = calcTransportCost(destTransport);
  const dayActivities = pickActivities(destActivities, isSenior, pureVeg);
  const activityCost = calcActivityCost(dayActivities);
  const dailyFood = foodPlan.totalPerDay;
  const transportCost = transportInfo?.cost ?? 0;

  const dayPlans: DayPlan[] = [];
  const startDate = req.startDate ? new Date(req.startDate) : new Date();

  for (let day = 1; day <= req.days; day++) {
    const rankedStay: RankedStay | undefined =
      rankedStays[(day - 1) % Math.max(rankedStays.length, 1)];
    const stay = rankedStay?.stay ?? null;

    const date = new Date(startDate);
    date.setDate(date.getDate() + day - 1);

    const stayCost = stay
      ? calcStayCost({
          stay,
          nights: 1,
          partySize: req.partySize,
          isSenior,
          pureVeg,
        })
      : 0;

    const dayTransport = day === 1 ? transportInfo : null;
    const dayTransportCost = day === 1 ? transportCost : 0;

    const perPersonCost = calcTotalPerPerson(
      stayCost,
      dailyFood,
      dayTransportCost,
      activityCost,
    );

    const targetNightly =
      (0.35 * req.budgetPerPerson) / Math.max(nights, 1);

    const transparencyTag = stay
      ? buildTransparencyTag(
          stay,
          rankedStay?.intentFit ?? 0,
          targetNightly,
        )
      : null;

    dayPlans.push({
      day,
      date: formatDate(date),
      stay,
      activities: dayActivities,
      food: foodPlan.meals,
      transport: dayTransport,
      perPersonCost,
      stayCost,
      foodCost: dailyFood,
      transportCost: dayTransportCost,
      activityCost,
      transparencyTag,
      restBlock: isSenior ? '1:00 PM – 4:30 PM' : null,
    });
  }

  const totalPerPerson = dayPlans.reduce(
    (sum, d) => sum + d.perPersonCost,
    0,
  );

  const shortfallResult = calcShortfall(
    totalPerPerson,
    req.budgetPerPerson,
  );

  if (!shortfallResult.feasible) {
    warnings.push(
      `Budget shortfall: your budget of ${formatINR(req.budgetPerPerson)} per person does not cover the estimated cost of ${formatINR(totalPerPerson)}. You need ${formatINR(shortfallResult.shortfall!)} more per person.`,
    );
  }

  if (isSenior) {
    warnings.push(
      'Senior profile active: max 2 activities/day, 1:00 PM–4:30 PM rest block enforced, lift/ground floor only, pure-veg nearby.',
    );
  }

  if (rankedStays.length < 3) {
    warnings.push(
      `Only ${rankedStays.length} stay(s) matched your criteria. Consider relaxing filters.`,
    );
  }

  return {
    days: dayPlans,
    totalPerPerson,
    budgetPerPerson: req.budgetPerPerson,
    shortfall: shortfallResult.shortfall,
    minimumViableBudget: shortfallResult.minimumViableBudget,
    warnings,
    rejected: false,
    rejectionMessage: null,
    limitedStays,
    limitedStaysCount: destStays.length,
    aiExplanation: null,
    aiExplanationVisible: false,
  };
}

export function getAiExplanationVisibility(
  reviewStatus: string,
  aiExplanation: string | null,
): { visible: boolean; displayText: string | null } {
  if (aiExplanation && (reviewStatus === 'Approved' || reviewStatus === 'Edited')) {
    return { visible: true, displayText: aiExplanation };
  }
  return { visible: false, displayText: 'Explanation under review' };
}
