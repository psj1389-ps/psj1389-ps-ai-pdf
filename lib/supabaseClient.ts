import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These variables should be configured in your environment.
// For local development, you can create a .env.local file.
// For deployment, configure them in your hosting provider's settings.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are not set. Please set SUPABASE_URL and SUPABASE_ANON_KEY.'
  );
}

// The `!` asserts that the values are not null/undefined. The check above ensures this.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
