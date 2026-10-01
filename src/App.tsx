import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { initRouter, subscribe, type Route } from '@/lib/router';
import Navigation from '@/components/Navigation';
import SignInPage from '@/pages/SignInPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import MyTripsPage from '@/pages/MyTripsPage';
import SettingsPage from '@/pages/SettingsPage';
import { Compass } from 'lucide-react';

initRouter();

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [route, setRoute] = useState<Route>('sign-in');

  useEffect(() => {
    const unsub = subscribe((r) => setRoute(r.route));
    setRoute(initRouter().route);
    return () => { unsub(); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Compass className="w-8 h-8 text-slate-300 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return <SignInPage />;
  }

  if (session && !profile?.profile_type && route === 'onboarding') {
    return <OnboardingPage />;
  }

  if (route === 'onboarding' && profile?.profile_type) {
    return <DashboardPage />;
  }

  let page;
  switch (route) {
    case 'onboarding':
      page = <OnboardingPage />;
      break;
    case 'dashboard':
      page = <DashboardPage />;
      break;
    case 'my-trips':
      page = <MyTripsPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
    default:
      page = <DashboardPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation activeRoute={route} />
      {page}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
