import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/format';
import {
  planTrip,
  type Catalogue,
} from '@/lib/planner';
import { runDevSelfTest } from '@/lib/selfTest';
import { fallbackCatalogue } from '@/lib/fallbackData';
import type { Stay, Activity, FoodCost, TransportCost, TripData, TripRequest } from '@/types';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Bed,
  Utensils,
  Bus,
  Mountain,
  Info,
  Save,
  Loader2,
  Pencil,
  X,
  Clock,
} from 'lucide-react';

const quickStartChips = [
  {
    label: 'Gokarna, 3 days, 4 friends, ₹10,000 per person, acoustic beach hostel, no curfew',
    request: {
      destination: 'Gokarna',
      days: 3,
      partySize: 4,
      budgetPerPerson: 10000,
      vibe: 'acoustic beach hostel no curfew',
      curfew: 'no curfew',
    },
  },
  {
    label: 'Shirdi + Nashik, 3 days, 2 seniors, slow pace, pure-veg, lift required',
    request: {
      destination: 'Shirdi',
      days: 3,
      partySize: 2,
      budgetPerPerson: 12000,
      vibe: 'slow pace pure-veg',
      pureVeg: true,
      liftRequired: true,
      slowPace: true,
    },
  },
  {
    label: '₹1,500 for 4 days in Gokarna',
    request: {
      destination: 'Gokarna',
      days: 4,
      partySize: 1,
      budgetPerPerson: 1500,
      vibe: 'budget',
    },
  },
];

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(fallbackCatalogue);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [currentRequest, setCurrentRequest] = useState<TripRequest | null>(null);

  useEffect(() => {
    (async () => {
      console.log('[Dashboard] Fetching catalogue from Supabase...');
      try {
        const [staysRes, activitiesRes, foodRes, transportRes] = await Promise.all([
          supabase.from('stays').select('*'),
          supabase.from('activities').select('*'),
          supabase.from('food_costs').select('*'),
          supabase.from('transport_costs').select('*'),
        ]);

        if (staysRes.error) console.error('[Dashboard] Error fetching stays:', staysRes.error.message);
        if (activitiesRes.error) console.error('[Dashboard] Error fetching activities:', activitiesRes.error.message);
        if (foodRes.error) console.error('[Dashboard] Error fetching food_costs:', foodRes.error.message);
        if (transportRes.error) console.error('[Dashboard] Error fetching transport_costs:', transportRes.error.message);

        
const rawStays = (staysRes.data ?? []) as Record<string, unknown>[];
const rawActivities = (activitiesRes.data ?? []) as Record<string, unknown>[];
const rawFood = (foodRes.data ?? []) as Record<string, unknown>[];
const rawTransport = (transportRes.data ?? []) as Record<string, unknown>[];

const stays: Stay[] = rawStays.map((s) => ({
  id: String(s.id ?? ''),
  name: String(s.name ?? 'Unnamed Stay'),
  destination: String(s.destination ?? ''),
  type: (s.type ?? 'hotel') as Stay['type'],
  price_per_night: Number(s.price_per_night ?? 0),
  vibe: Array.isArray(s.vibe_tags)
    ? s.vibe_tags.join(', ')
    : String(s.vibe ?? ''),
  rating: Number(s.rating ?? 0),
  distance_to_hub_km: Number(s.distance_to_hub_km ?? 0),
  has_lift: Boolean(s.lift_verified ?? s.has_lift ?? false),
  ground_floor_only: Boolean(s.ground_floor ?? s.ground_floor_only ?? false),
  pure_veg_nearby: Boolean(s.pure_veg_nearby ?? false),
  curfew: s.curfew == null ? null : String(s.curfew),
  verified_offbeat: Boolean(s.verified_offbeat ?? false),
}));

const activities: Activity[] = rawActivities.map((a) => ({
  id: String(a.id ?? ''),
  name: String(a.name ?? 'Activity'),
  destination: String(a.destination ?? ''),
  category: String(a.category ?? a.effort_level ?? 'General'),
  price_per_person: Number(a.price ?? a.price_per_person ?? 0),
  duration_hours: Number(a.duration_hrs ?? a.duration_hours ?? 0),
  senior_friendly: Boolean(a.senior_friendly ?? false),
  pure_veg_nearby: Boolean(a.pure_veg_nearby ?? false),
}));
        
const foodCosts: FoodCost[] = rawFood.map((f) => ({
  id: String(f.id ?? ''),
  destination: String(f.destination ?? ''),
  daily_food_band: String(f.daily_food_band ?? 'Standard'),
  cost_per_person_per_day: Number(f.cost_per_person_per_day ?? 0),
}));

const transportCosts: TransportCost[] = rawTransport.map((t) => ({
  id: String(t.id ?? ''),
  destination: String(t.destination ?? ''),
  mode: String(t.mode ?? 'Unknown'),
  cost_per_person_per_day: Number(t.cost_per_person_per_day ?? 0),
}));

        console.log(`[Dashboard] Fetched: ${stays.length} stays, ${activities.length} activities, ${foodCosts.length} food costs, ${transportCosts.length} transport costs`);

        const hasData = stays.length > 0 || activities.length > 0 || foodCosts.length > 0 || transportCosts.length > 0;
        if (!hasData) {
          console.warn('[Dashboard] Catalogue queries returned empty — using fallback seed data.');
          setCatalogue(fallbackCatalogue);
        } else {
          setCatalogue({
            stays: stays.length > 0 ? stays : fallbackCatalogue.stays,
            activities: activities.length > 0 ? activities : fallbackCatalogue.activities,
            foodCosts: foodCosts.length > 0 ? foodCosts : fallbackCatalogue.foodCosts,
            transportCosts: transportCosts.length > 0 ? transportCosts : fallbackCatalogue.transportCosts,
          });
        }
      } catch (err) {
        console.error('[Dashboard] Catalogue fetch failed, using fallback seed data:', err);
        setCatalogue(fallbackCatalogue);
      }
    })();
  }, []);

  useEffect(() => {
    if (catalogue) {
      runDevSelfTest(catalogue);
    }
  }, [catalogue]);

  const profileType = profile?.profile_type ?? 'friends';
  const isSenior = profileType === 'senior_pilgrim';
  console.log('[Dashboard] Rendering — profile:', profile?.email, 'profileType:', profile?.profile_type, 'resolved:', profileType, 'catalogue loaded:', !!catalogue, 'stays:', catalogue?.stays.length ?? 0);

  const handleGenerate = useCallback(
    (req: TripRequest) => {
      if (!catalogue) return;
      setLoading(true);
      setSaveMsg(null);
      setCurrentRequest(req);

      setTimeout(() => {
        const data = planTrip(catalogue, req, profileType);
        console.log('[Dashboard] Plan generated:', { rejected: data.rejected, days: data.days.length, totalPerPerson: data.totalPerPerson, shortfall: data.shortfall });
        setTripData(data);
        setActiveDay(1);
        setLoading(false);
      }, 600);
    },
    [catalogue, profileType],
  );

  const handleQuickStart = (req: TripRequest) => {
    handleGenerate(req);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const parsed = parseChatInput(chatInput);
    handleGenerate(parsed);
    setChatInput('');
  };

  const handleSaveTrip = async () => {
    if (!tripData || !currentRequest || !profile) return;
    setSaving(true);
    setSaveMsg(null);

    const dest = currentRequest.destination;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + currentRequest.days - 1);

    const { error } = await supabase.from('itineraries').insert({
      user_id: profile.id,
      destination: dest,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      party_size: currentRequest.partySize,
      budget_per_person: currentRequest.budgetPerPerson,
      vibe_text: currentRequest.vibe ?? null,
      profile_type: profileType,
      itinerary_json: tripData,
      total_cost_per_person: tripData.totalPerPerson,
      budget_status: tripData.shortfall !== null ? 'shortfall' : 'feasible',
      review_status: 'Pending',
    });

    if (error) {
      console.error('[Dashboard] Failed to save itinerary:', error.message);
      setSaveMsg(`Failed to save trip: ${error.message}`);
    } else {
      setSaveMsg('Trip saved to My Trips!');
    }
    setSaving(false);
  };

  const handleSwitchPersona = async () => {
    const newType = isSenior ? 'friends' : 'senior_pilgrim';
    await supabase.from('profiles').update({ profile_type: newType }).eq('id', profile!.id);
    await refreshProfile();
    if (currentRequest) handleGenerate(currentRequest);
  };

  const handleEditDay = (day: number, newBudget: number) => {
    if (!tripData) return;
    const updated = { ...tripData };
    const dayPlan = updated.days.find((d) => d.day === day);
    if (dayPlan) {
      dayPlan.perPersonCost = newBudget;
      updated.totalPerPerson = updated.days.reduce((s, d) => s + d.perPersonCost, 0);
      if (updated.totalPerPerson > updated.budgetPerPerson) {
        updated.shortfall = updated.totalPerPerson - updated.budgetPerPerson;
        updated.minimumViableBudget = Math.ceil(updated.totalPerPerson / 100) * 100;
      } else {
        updated.shortfall = null;
        updated.minimumViableBudget = null;
      }
    }
    setTripData(updated);
    setEditingDay(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      {/* Sticky header with profile */}
      <div className="sticky top-14 md:top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSenior ? 'bg-[#0A438B]/10' : 'bg-[#E41D26]/10'}`}>
              {isSenior ? <Sparkles className="w-5 h-5 text-[#0A438B]" /> : <Compass className="w-5 h-5 text-[#E41D26]" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isSenior ? 'Senior Pilgrim' : 'Friends Group'}
              </p>
              <p className="text-xs text-slate-500">
                {isSenior ? 'Rameshwar Kulkarni' : 'Kabir Sen'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSwitchPersona}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Switch Persona
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick-start chips */}
        {!tripData && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E41D26]" />
              Quick Start
            </h2>
            <div className="flex flex-wrap gap-2">
              {quickStartChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickStart(chip.request)}
                  className="px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-[#E41D26] hover:text-[#E41D26] hover:shadow-sm transition-all text-left"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat intake bar */}
        <div>
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="e.g. Gokarna, 3 days, 4 friends, ₹8000/person, beach hostel..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A438B]/20 focus:border-[#0A438B] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !catalogue}
              className="px-5 py-3 rounded-xl bg-[#E41D26] text-white text-sm font-semibold hover:bg-[#c91820] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="hidden sm:inline">Plan</span>
            </button>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#E41D26] animate-spin mb-3" />
            <p className="text-sm text-slate-500">Crafting your itinerary...</p>
          </div>
        )}

        {/* Trip results */}
        {tripData && !loading && (
          <>
            {/* Rejection message */}
            {tripData.rejected && tripData.rejectionMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Unable to Plan This Trip</p>
                    <p className="text-xs text-red-600 mt-1">{tripData.rejectionMessage}</p>
                    {tripData.minimumViableBudget !== null && (
                      <p className="text-xs text-red-600 mt-1">
                        Minimum viable budget: <strong>{formatINR(tripData.minimumViableBudget)}</strong> per person.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Limited stays notice */}
            {tripData.limitedStays && !tripData.rejected && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    We found only {tripData.limitedStaysCount} bookable stays in this destination.
                  </p>
                </div>
              </div>
            )}

            {/* Budget warning banner */}
            {!tripData.rejected && tripData.shortfall !== null && tripData.shortfall > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Budget Shortfall Detected</p>
                    <p className="text-xs text-red-600 mt-1">
                      Your budget covers {formatINR(tripData.budgetPerPerson)} per person, but the estimated cost is{' '}
                      {formatINR(tripData.totalPerPerson)}. You need{' '}
                      <strong>{formatINR(tripData.shortfall)}</strong> more per person.
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Minimum viable budget: <strong>{formatINR(tripData.minimumViableBudget || 0)}</strong> per person.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Budget OK banner */}
            {!tripData.rejected && tripData.shortfall === null && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Budget Feasible</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Estimated {formatINR(tripData.totalPerPerson)} per person vs. your budget of{' '}
                      {formatINR(tripData.budgetPerPerson)}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Guardrail warnings */}
            {!tripData.rejected && tripData.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {tripData.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700">{w}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Day tabs */}
            {!tripData.rejected && tripData.days.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tripData.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeDay === day.day
                        ? 'bg-[#0A438B] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            )}

            {/* Day detail */}
            {!tripData.rejected && tripData.days.map((day) => {
              if (day.day !== activeDay) return null;
              return (
                <div key={day.day} className="space-y-4">
                  {/* Day summary */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800">Day {day.day} — Cost Breakdown</h3>
                      <button
                        onClick={() => setEditingDay(day.day)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0A438B] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Adjust
                      </button>
                    </div>

                    {editingDay === day.day && (
                      <EditDayForm
                        day={day.day}
                        currentCost={day.perPersonCost}
                        onSave={handleEditDay}
                        onCancel={() => setEditingDay(null)}
                      />
                    )}

                    <div className="space-y-2">
                      {day.stay && (
                        <CostRow icon={Bed} label="Stay" cost={day.stay.price_per_night} />
                      )}
                      {day.transport && (
                        <CostRow icon={Bus} label={`Transport (${day.transport.mode})`} cost={day.transport.cost} />
                      )}
                      {day.food.map((f, i) => (
                        <CostRow key={i} icon={Utensils} label={f.meal} cost={f.cost} />
                      ))}
                      {day.activities.length > 0 && (
                        <CostRow
                          icon={Mountain}
                          label={`Activities (${day.activities.length})`}
                          cost={day.activities.reduce((s, a) => s + a.price_per_person, 0)}
                        />
                      )}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Per Person Total</span>
                        <span className="text-sm font-bold text-[#E41D26]">{formatINR(day.perPersonCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stay card */}
                  {day.stay && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Bed className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-medium text-slate-500 uppercase">{day.stay.type}</span>
                            </div>
                            <h4 className="font-bold text-slate-800">{day.stay.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{day.stay.vibe}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{formatINR(day.stay.price_per_night)}</p>
                            <p className="text-xs text-slate-400">per night</p>
                          </div>
                        </div>

                        {/* Why This Stay transparency tag */}
                        {day.transparencyTag && (
                          <div className="mt-3 p-3 rounded-lg bg-[#0A438B]/5 border border-[#0A438B]/15">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Info className="w-3.5 h-3.5 text-[#0A438B]" />
                              <span className="text-xs font-semibold text-[#0A438B]">Why This Stay</span>
                            </div>
                            <p className="text-xs text-slate-600">{day.transparencyTag}</p>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {day.stay.verified_offbeat && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                              Verified Offbeat
                            </span>
                          )}
                          {day.stay.has_lift && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Lift Available
                            </span>
                          )}
                          {day.stay.ground_floor_only && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Ground Floor
                            </span>
                          )}
                          {day.stay.pure_veg_nearby && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                              Pure Veg Nearby
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {day.stay.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {day.activities.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-slate-400" />
                        Activities {isSenior && <span className="text-xs text-slate-400">(max 2/day)</span>}
                      </h4>
                      <div className="space-y-2">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{act.name}</p>
                              <p className="text-xs text-slate-400">{act.category} • {act.duration_hours}h</p>
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                              {act.price_per_person === 0 ? 'Free' : formatINR(act.price_per_person)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {isSenior && (
                        <p className="text-xs text-[#0A438B] mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          1:00 PM – 4:30 PM rest block included
                        </p>
                      )}
                    </div>
                  )}

                  {/* Modification bar */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Want to adjust anything? Use the Adjust button on each day.</span>
                  </div>
                </div>
              );
            })}

            {/* Grand total + save */}
            {!tripData.rejected && tripData.days.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Per Person</span>
                <span className="text-lg font-bold text-[#E41D26]">{formatINR(tripData.totalPerPerson)}</span>
              </div>
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#0A438B] text-white text-sm font-semibold hover:bg-[#08366f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save to My Trips
              </button>
              {saveMsg && (
                <p className={`text-xs text-center ${saveMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMsg}
                </p>
              )}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!tripData && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">
              Pick a quick-start option or describe your trip above to generate an itinerary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CostRow({ icon: Icon, label, cost }: { icon: typeof Bed; label: string; cost: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm text-slate-600 capitalize">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-700">{formatINR(cost)}</span>
    </div>
  );
}

function EditDayForm({
  day,
  currentCost,
  onSave,
  onCancel,
}: {
  day: number;
  currentCost: number;
  onSave: (day: number, newBudget: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(currentCost.toString());

  return (
    <div className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-xs font-medium text-slate-600 mb-2">Adjust Day {day} per-person cost</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A438B]/20"
        />
        <button
          onClick={() => onSave(day, Number(value))}
          className="px-3 py-2 rounded-lg bg-[#0A438B] text-white text-xs font-medium hover:bg-[#08366f]"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-500 text-xs font-medium"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function parseChatInput(input: string): TripRequest {
  const lower = input.toLowerCase();
  const destMatch = lower.match(/gokarna|shirdi|nashik/);
  const destination = destMatch ? destMatch[0].charAt(0).toUpperCase() + destMatch[0].slice(1) : 'Gokarna';

  const daysMatch = lower.match(/(\d+)\s*days?/);
  const days = daysMatch ? parseInt(daysMatch[1]) : 3;

  const partyMatch = lower.match(/(\d+)\s*(friends?|people|persons?|seniors?|guests?)/);
  const partySize = partyMatch ? parseInt(partyMatch[1]) : 2;

  const budgetMatch = lower.match(/₹\s*([0-9,]+)|rs\.?\s*([0-9,]+)|([0-9,]+)\s*rupees?/);
  const budgetStr = budgetMatch ? (budgetMatch[1] || budgetMatch[2] || budgetMatch[3]).replace(/,/g, '') : '10000';
  const budgetPerPerson = parseInt(budgetStr);

  const pureVeg = lower.includes('pure-veg') || lower.includes('pure veg') || lower.includes('veg');
  const liftRequired = lower.includes('lift') || lower.includes('accessible');
  const slowPace = lower.includes('slow') || lower.includes('senior');
  const curfew = lower.includes('no curfew') ? 'no curfew' : undefined;

  return {
    destination,
    days,
    partySize,
    budgetPerPerson,
    vibe: lower,
    pureVeg,
    liftRequired,
    slowPace,
    curfew,
  };
}
