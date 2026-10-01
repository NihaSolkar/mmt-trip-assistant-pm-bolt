import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ydbwritiapyurfiprbaq.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYndyaXRpYXB5dXJmaXByYmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjI1MzEsImV4cCI6MjEwNjQzODUzMX0.IxteH24IEXOf_5yPDsWWtb4I8kq1vH0YMOCTQyL2K-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});
