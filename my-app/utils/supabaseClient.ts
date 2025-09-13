import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL =  process.env.REACT_APP_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
