import type { Stay, Activity, FoodCost, TransportCost } from '@/types';
import { planTrip, type Catalogue } from '@/lib/planner';

export interface SelfTestResult {
  name: string;
  passed: boolean;
  message: string;
}

export function runSelfTest(catalogue: Catalogue): SelfTestResult[] {
  const results: SelfTestResult[] = [];

  const gokarnaStays = catalogue.stays.filter(
    (s) => s.destination === 'Gokarna',
  );
  const gokarnaFood = catalogue.foodCosts.filter(
    (f) => f.destination === 'Gokarna',
  );
  const gokarnaTransport = catalogue.transportCosts.filter(
    (t) => t.route.includes('Gokarna'),
  );
  const gokarnaActivities = catalogue.activities.filter(
    (a) => a.destination === 'Gokarna',
  );

  const result1500 = planTrip(
    catalogue,
    {
      destination: 'Gokarna',
      days: 4,
      partySize: 1,
      budgetPerPerson: 1500,
      vibe: 'budget',
    },
    'friends',
  );

  if (result1500.rejected && result1500.rejectionMessage) {
    results.push({
      name: 'Test A: ₹1,500 Gokarna shortfall',
      passed: false,
      message: `Expected shortfall result but got rejection: ${result1500.rejectionMessage}`,
    });
  } else if (
    result1500.shortfall !== null &&
    result1500.shortfall > 0 &&
    result1500.minimumViableBudget !== null
  ) {
    results.push({
      name: 'Test A: ₹1,500 Gokarna shortfall',
      passed: true,
      message: `Shortfall detected: ${result1500.shortfall} INR. Minimum viable budget: ${result1500.minimumViableBudget} INR.`,
    });
  } else {
    const totalCost = result1500.totalPerPerson;
    if (totalCost > 1500) {
      results.push({
        name: 'Test A: ₹1,500 Gokarna shortfall',
        passed: true,
        message: `Cost ${totalCost} exceeds budget 1500 — shortfall correctly identified.`,
      });
    } else {
      results.push({
        name: 'Test A: ₹1,500 Gokarna shortfall',
        passed: false,
        message: `Expected shortfall for ₹1,500/4-day Gokarna trip but total cost was ${totalCost} (within budget). Check catalogue prices.`,
      });
    }
  }

  const bangkokResult = planTrip(
    catalogue,
    {
      destination: 'Bangkok',
      days: 3,
      partySize: 2,
      budgetPerPerson: 20000,
    },
    'friends',
  );

  if (
    bangkokResult.rejected &&
    bangkokResult.rejectionMessage?.includes('Bangkok')
  ) {
    results.push({
      name: 'Test B: Bangkok rejection',
      passed: true,
      message: `Bangkok correctly rejected: ${bangkokResult.rejectionMessage}`,
    });
  } else {
    results.push({
      name: 'Test B: Bangkok rejection',
      passed: false,
      message: `Expected Bangkok to be rejected, but it was not. Days generated: ${bangkokResult.days.length}`,
    });
  }

  return results;
}

export function runDevSelfTest(catalogue: Catalogue | null): void {
  if (import.meta.env.PROD) return;
  if (!catalogue) {
    console.warn('[SelfTest] Catalogue not yet loaded — skipping self-test.');
    return;
  }

  console.group('[SelfTest] Running development self-tests...');
  const results = runSelfTest(catalogue);
  let allPassed = true;
  for (const r of results) {
    if (r.passed) {
      console.log(`%cPASS: ${r.name} — ${r.message}`, 'color: green;');
    } else {
      console.error(`FAIL: ${r.name} — ${r.message}`);
      allPassed = false;
    }
  }
  if (allPassed) {
    console.log('%c[SelfTest] All tests PASSED.', 'color: green; font-weight: bold;');
  } else {
    console.error('[SelfTest] Some tests FAILED.');
  }
  console.groupEnd();
}
