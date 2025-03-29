import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Ensure environment variables are defined
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  log('Supabase URL or key not provided. Please check your environment variables.', 'supabase');
  throw new Error('Supabase URL or key not provided');
}

// Create the Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

log('Supabase client initialized', 'supabase');