import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';
import { Mail, User, Shield, Trash2, AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { session, profile, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<'success' | 'error' | null>(null);

  const handleDeleteData = async () => {
    setDeleting(true);
    setDeleteResult(null);

    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('user_id', session!.user.id);

    if (error) {
      setDeleteResult('error');
    } else {
      setDeleteResult('success');
    }
    setDeleting(false);
  };

  const profileLabel =
    profile?.profile_type === 'friends'
      ? 'Friends Group (Kabir Sen)'
      : profile?.profile_type === 'senior_pilgrim'
        ? 'Senior Pilgrim (Rameshwar Kulkarni)'
        : 'Not selected';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>

        {/* Account info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-700">{session?.user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Profile Type</p>
                <p className="text-sm font-medium text-slate-700">{profileLabel}</p>
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Data privacy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Data & Privacy
          </h2>
          <p className="text-xs text-slate-500">
            Your trip data is stored securely and scoped to your account. You can delete all your saved itineraries at any time.
          </p>
          <button
            onClick={() => {
              setDeleteResult(null);
              setShowDeleteModal(true);
            }}
            className="w-full py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Data
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">About</h2>
          <p className="text-xs text-slate-500">
            MakeMyTrip TripAssistant AI — Plan trips with budget-aware, persona-driven recommendations for Indian destinations.
          </p>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            {deleteResult === 'success' ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="text-sm font-semibold text-slate-800">All trip data deleted</p>
                <p className="text-xs text-slate-500">Your saved itineraries have been removed.</p>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    navigate('dashboard');
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#0A438B] text-white text-sm font-semibold hover:bg-[#08366f] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : deleteResult === 'error' ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Something went wrong</p>
                <p className="text-xs text-slate-500">Failed to delete your data. Please try again.</p>
                <button
                  onClick={() => setDeleteResult(null)}
                  className="w-full py-2.5 rounded-lg bg-[#0A438B] text-white text-sm font-semibold hover:bg-[#08366f] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <button onClick={() => setShowDeleteModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Delete All Trip Data?</h3>
                <p className="text-sm text-slate-500 mb-5">
                  This will permanently delete all your saved itineraries. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteData}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
