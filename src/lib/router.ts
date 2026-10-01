import { formatINR } from '@/lib/format';

export type Route = 'sign-in' | 'onboarding' | 'dashboard' | 'my-trips' | 'settings';

interface RouteState {
  route: Route;
  tripId?: string;
}

let currentRoute: RouteState = { route: 'sign-in' };
const listeners = new Set<(r: RouteState) => void>();

export function navigate(route: Route, tripId?: string) {
  currentRoute = { route, tripId };
  window.history.pushState({ route, tripId }, '', `#/${route}`);
  listeners.forEach((l) => l(currentRoute));
}

export function getRoute(): RouteState {
  return currentRoute;
}

export function subscribe(listener: (r: RouteState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function parseHash(): RouteState {
  const hash = window.location.hash.replace('#/', '');
  const valid: Route[] = ['sign-in', 'onboarding', 'dashboard', 'my-trips', 'settings'];
  const route = valid.includes(hash as Route) ? (hash as Route) : 'sign-in';
  return { route };
}

export function initRouter(): RouteState {
  const { route } = parseHash();
  currentRoute = { route };
  window.addEventListener('popstate', () => {
    const { route } = parseHash();
    currentRoute = { route };
    listeners.forEach((l) => l(currentRoute));
  });
  return currentRoute;
}


