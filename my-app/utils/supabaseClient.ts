import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL =  process.env.REACT_APP_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function handleSignUp(id: number, name: string, age: number, email: string, occupation: string, financial_goals: string) {
    const { data, error} = await supabase
    .from('Users')
    .insert({
        id,
        name,
        age,
        email,
        occupation,
        financial_goals
    });
    if (error) {
        console.error('Error signing up:', error.message);
    } else {
        console.log('Sign-up successful', data);
    }
}
