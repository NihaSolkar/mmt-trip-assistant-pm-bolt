import { useAuth } from '@/context/AuthContext';
import { navigate, type Route } from '@/lib/router';
import { Compass, MapPin, Settings, LogOut, User } from 'lucide-react';
import { useState } from 'react';

const navItems: { route: Route; label: string; icon: typeof Compass }[] = [
  { route: 'dashboard', label: 'Plan Trip', icon: Compass },
  { route: 'my-trips', label: 'My Trips', icon: MapPin },
  { route: 'settings', label: 'Settings', icon: Settings },
];

export default function Navigation({ activeRoute }: { activeRoute: Route }) {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const profileLabel =
    profile?.profile_type === 'friends'
      ? 'Friends Group'
      : profile?.profile_type === 'senior_pilgrim'
        ? 'Senior Pilgrim'
        : 'Guest';

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-40 hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#E41D26] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0A438B]">TripAssistant</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#0A438B]/10 text-[#0A438B]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{profileLabel}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 md:hidden bg-white border-b border-slate-200">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E41D26] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-[#0A438B]">TripAssistant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{profileLabel}</span>
            <button onClick={signOut} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200">
        <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  active ? 'text-[#E41D26]' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
