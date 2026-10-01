import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';
import { formatINR } from '@/lib/format';
import type { Itinerary, TripData } from '@/types';
import { MapPin, Calendar, Users, Wallet, Plus, ChevronRight, Compass, X, Bed, Utensils, Bus, Mountain } from 'lucide-react';

export default function MyTripsPage() {
  const { session } = useAuth();
  const [trips, setTrips] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Itinerary | null>(null);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load trips:', error.message);
      }
      setTrips((data as Itinerary[]) || []);
      setLoading(false);
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Compass className="w-6 h-6 text-slate-300 animate-pulse" />
      </div>
    );
  }

  // Detail view
  if (selectedTrip) {
    const tripData = selectedTrip.trip_data as TripData;
    return (
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <button
            onClick={() => setSelectedTrip(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
            Close
          </button>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-800">{selectedTrip.destination}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedTrip.start_date} → {selectedTrip.end_date}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {selectedTrip.party_size} people
              </span>
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                {formatINR(selectedTrip.per_person_budget || 0)} /person
              </span>
            </div>
            <div className="mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                selectedTrip.review_status === 'saved'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {selectedTrip.review_status}
              </span>
            </div>
          </div>

          {tripData?.shortfall !== null && tripData?.shortfall !== undefined && tripData.shortfall > 0 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              Budget shortfall: {formatINR(tripData.shortfall)} per person. Minimum viable: {formatINR(tripData.minimumViableBudget || 0)}.
            </div>
          )}

          {/* Day tabs */}
          {tripData && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tripData.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeDay === day.day
                        ? 'bg-[#0A438B] text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>

              {tripData.days.filter((d) => d.day === activeDay).map((day) => (
                <div key={day.day} className="space-y-3">
                  {day.stay && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bed className="w-4 h-4 text-slate-400" />
                        <span className="text-xs uppercase font-medium text-slate-500">{day.stay.type}</span>
                      </div>
                      <h4 className="font-bold text-slate-800">{day.stay.name}</h4>
                      <p className="text-xs text-slate-500">{day.stay.vibe}</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{formatINR(day.stay.price_per_night)}/night</p>
                    </div>
                  )}

                  {day.activities.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-slate-400" />
                        Activities
                      </h4>
                      {day.activities.map((act, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                          <span className="text-slate-600">{act.name}</span>
                          <span className="text-slate-500">{act.price_per_person === 0 ? 'Free' : formatINR(act.price_per_person)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-slate-400" />
                      Food
                    </h4>
                    {day.food.map((f, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-slate-600 capitalize">{f.meal}</span>
                        <span className="text-slate-500">{formatINR(f.cost)}</span>
                      </div>
                    ))}
                  </div>

                  {day.transport && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Bus className="w-4 h-4 text-slate-400" />
                        Transport
                      </h4>
                      <p className="text-sm text-slate-600">
                        {day.transport.route} — {day.transport.mode} ({formatINR(day.transport.cost)})
                      </p>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Day {day.day} Total</span>
                    <span className="text-sm font-bold text-[#E41D26]">{formatINR(day.perPersonCost)}</span>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Per Person</span>
                <span className="text-lg font-bold text-[#E41D26]">{formatINR(tripData.totalPerPerson)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-slate-800 mb-4">My Trips</h1>

        {trips.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 mb-4">No trips saved yet.</p>
            <button
              onClick={() => navigate('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E41D26] text-white text-sm font-semibold hover:bg-[#c91820] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Plan a New Trip
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => {
                  setSelectedTrip(trip);
                  setActiveDay(1);
                }}
                className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{trip.destination}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {trip.start_date} → {trip.end_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {trip.party_size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {formatINR(trip.per_person_budget || 0)}/person
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      trip.review_status === 'saved'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {trip.review_status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
