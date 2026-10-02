import type { Stay } from '@/types';

const LAMBDA = 0.5;
const RATING_PRIOR_WEIGHT = 20;
const BASELINE_RATING = 3.5;

export interface RankedStay {
  stay: Stay;
  score: number;
  intentFit: number;
  adjustedRating: number;
  popularityPrior: number;
  pricePrior: number;
  centralityPrior: number;
  prior: number;
}

export interface RankingContext {
  stays: Stay[];
  budgetPerPerson: number;
  nights: number;
  userVibeTags: string[];
  noCurfew: boolean;
  isSenior: boolean;
  pureVeg: boolean;
}

function tokenize(text: string | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function isChain(stay: Stay): boolean {
  return stay.type === 'hotel' || stay.type === 'resort';
}

function isOffbeat(stay: Stay): boolean {
  return stay.type === 'hostel' || stay.type === 'homestay';
}
}

export function rankStays(ctx: RankingContext): RankedStay[] {
  const {
    stays,
    budgetPerPerson,
    nights,
    userVibeTags,
    noCurfew,
    isSenior,
    pureVeg,
  } = ctx;

  let pool = [...stays];

  if (isSenior) {
  pool = pool.filter(
    (s) => s.has_lift === true || s.ground_floor_only === true
  );
}

if (pureVeg) {
  pool = pool.filter((s) => s.pure_veg_nearby === true);
}

  if (noCurfew) {
    pool = pool.filter((s) => s.curfew === 'none' || s.curfew === null);
  }

  const targetNightly = (0.35 * budgetPerPerson) / Math.max(nights, 1);
  const maxDistance = Math.max(
    ...pool.map((s) => s.distance_to_hub_km || 0),
    1,
  );

  const scored = pool.map((stay) => {
    const stayVibeTags = Array.isArray(stay.vibe_tags)
  ? stay.vibe_tags
  : tokenize(stay.vibe ?? null);
    const intentFit =
      userVibeTags.length === 0
        ? 0
        : userVibeTags.filter((tag) => stayVibeTags.includes(tag)).length /
          userVibeTags.length;

    const reviewCount = 0;
    const rating = stay.rating ?? 0;
    const adjustedRating =
      (reviewCount * rating + RATING_PRIOR_WEIGHT * BASELINE_RATING) /
      (reviewCount + RATING_PRIOR_WEIGHT);

    const maxReviewCount = 1;
    const popularityPrior =
      Math.log(1 + reviewCount) / Math.log(1 + maxReviewCount);

    const pricePrior = Math.min(
      1,
      Math.abs(stay.price_per_night - targetNightly) / Math.max(targetNightly, 1),
    );

    const centralityPrior = 1 / (1 + (stay.distance_to_hub_km || 0));

    const prior =
      0.4 * popularityPrior + 0.3 * pricePrior + 0.3 * centralityPrior;

    const score =
      0.7 * intentFit +
      0.3 * (adjustedRating / 5) -
      LAMBDA * prior;

    return {
      stay,
      score,
      intentFit,
      adjustedRating,
      popularityPrior,
      pricePrior,
      centralityPrior,
      prior,
    } as RankedStay;
  });

  scored.sort((a, b) => b.score - a.score);

  return scored;
}

export interface RankingResult {
  ranked: RankedStay[];
  warnings: string[];
}

export function selectTopStays(
  ctx: RankingContext,
): RankingResult {
  const warnings: string[] = [];
  const ranked = rankStays(ctx);
  const targetNightly = (0.35 * ctx.budgetPerPerson) / Math.max(ctx.nights, 1);

  const budgetFiltered = ranked.filter((r) => {
    const occupancy = getOccupancy(r.stay, ctx);
    const perPerson = (r.stay.price_per_night * ctx.nights) / occupancy;
    return perPerson <= ctx.budgetPerPerson;
  });

  let pool = budgetFiltered.length > 0 ? budgetFiltered : ranked;

  if (pool.length === 0) {
    return { ranked: [], warnings: ['No qualifying stays found within budget.'] };
  }

  const result: RankedStay[] = [];
  const offbeat = pool.filter((r) => isOffbeat(r.stay));
  const chains = pool.filter((r) => isChain(r.stay));

  for (const r of offbeat) {
    if (result.length >= 3) break;
    result.push(r);
  }

  if (chains.length > 0 && result.length < 3) {
    result.push(chains[0]);
  }

  if (result.length < 3 && offbeat.length > result.filter((r) => isOffbeat(r.stay)).length) {
    for (const r of offbeat) {
      if (result.length >= 3) break;
      if (!result.includes(r)) result.push(r);
    }
  }

  if (result.length === 0 && pool.length > 0) {
    result.push(...pool.slice(0, 3));
  }

  if (result.filter((r) => isOffbeat(r.stay)).length === 0 && offbeat.length > 0) {
    warnings.push('No offbeat stay met the budget constraint; a chain hotel was selected instead.');
  }

  return { ranked: result.slice(0, 3), warnings };
}

export function getOccupancy(
  stay: Stay,
  ctx: { isSenior?: boolean; pureVeg?: boolean },
): number {
  switch (stay.type) {
    case 'hostel':
      return 1;
    case 'homestay':
    case 'resort':
      return Math.min(ctx.isSenior ? 2 : 3, 3);
    case 'hotel':
      return 2;
    default:
      return 1;
  }
}

export function isChainStay(stay: Stay): boolean {
  return isChain(stay);
}

export function isOffbeatStay(stay: Stay): boolean {
  return isOffbeat(stay);
}

export { isChain, isOffbeat };
