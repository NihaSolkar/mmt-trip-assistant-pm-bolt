import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import { Compass, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          navigate('onboarding');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('dashboard');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#E41D26] flex items-center justify-center shadow-lg shadow-red-200 mb-4">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A438B]">MakeMyTrip</h1>
          <p className="text-sm text-slate-500 mt-1">TripAssistant AI</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'signin'
                  ? 'text-[#E41D26] border-b-2 border-[#E41D26]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'text-[#E41D26] border-b-2 border-[#E41D26]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A438B]/20 focus:border-[#0A438B] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A438B]/20 focus:border-[#0A438B] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#E41D26] text-white text-sm font-semibold hover:bg-[#c91820] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-xs text-center text-slate-400">
              {mode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[#0A438B] font-medium hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
