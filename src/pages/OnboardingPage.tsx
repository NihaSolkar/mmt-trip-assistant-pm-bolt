import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';
import { Users, Heart, Accessibility, MapPin, Clock, Leaf, Loader2, Compass } from 'lucide-react';
import type { ProfileType } from '@/types';

interface PersonaCard {
  type: ProfileType;
  name: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: typeof Users;
  accent: string;
  bg: string;
}

const personas: PersonaCard[] = [
  {
    type: 'friends',
    name: 'Friends Group',
    subtitle: 'Kabir Sen',
    description: 'Budget-conscious, vibe-first trips with friends. Optimized for social hostels, beach hangs, and adventure.',
    features: ['Budget & Vibe matching', 'Social hostels & homestays', 'Adventure activities', 'No curfew stays'],
    icon: Users,
    accent: 'border-[#E41D26] bg-red-50',
    bg: 'from-red-50 to-orange-50',
  },
  {
    type: 'senior_pilgrim',
    name: 'Senior Pilgrim',
    subtitle: 'Rameshwar Kulkarni',
    description: 'Slow-paced, accessible pilgrimage travel. Optimized for comfort, pure-veg, and temple circuits.',
    features: ['Pacing & Accessibility', 'Lift / ground floor only', 'Pure-veg nearby', 'Max 2 activities/day'],
    icon: Heart,
    accent: 'border-[#0A438B] bg-blue-50',
    bg: 'from-blue-50 to-slate-50',
  },
];

export default function OnboardingPage() {
  const { session, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (type: ProfileType) => {
    setSelected(type);
    setError(null);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_type: type })
        .eq('id', session!.user.id);

      if (error) throw error;
      await refreshProfile();
      navigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save selection');
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#E41D26] flex items-center justify-center shadow-lg shadow-red-200 mx-auto mb-4">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A438B]">Choose Your Travel Persona</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            We'll tailor every itinerary — stay picks, activity pace, and food options — to your travel style.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selected === persona.type;
            return (
              <button
                key={persona.type}
                onClick={() => handleSelect(persona.type)}
                disabled={saving}
                className={`text-left p-6 rounded-2xl border-2 bg-gradient-to-br ${persona.bg} transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 ${
                  isSelected ? `${persona.accent} shadow-lg` : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    persona.type === 'friends' ? 'bg-[#E41D26]/10' : 'bg-[#0A438B]/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${persona.type === 'friends' ? 'text-[#E41D26]' : 'text-[#0A438B]'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{persona.name}</h3>
                    <p className="text-xs text-slate-500">{persona.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{persona.description}</p>

                <div className="space-y-2">
                  {persona.features.map((f) => {
                    const featureIcon =
                      f.includes('Budget') ? MapPin :
                      f.includes('hostel') ? Users :
                      f.includes('Adventure') ? Compass :
                      f.includes('Pacing') ? Clock :
                      f.includes('Lift') ? Accessibility :
                      f.includes('veg') ? Leaf :
                      f.includes('curfew') ? Clock :
                      MapPin;
                    const FIcon = featureIcon;
                    return (
                      <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <FIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {f}
                      </div>
                    );
                  })}
                </div>

                {isSelected && saving && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving your preference...
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
