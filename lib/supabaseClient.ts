import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these placeholder values with your actual Supabase project URL and anon key.
// You can find these in your Supabase project's settings under "API".
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-supabase-anon-key')) {
  console.warn(
    'Supabase credentials are not set. Please replace the placeholder values in `lib/supabaseClient.ts` with your actual Supabase URL and anon key for authentication to work.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);