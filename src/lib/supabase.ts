import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-kosaann.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'dummy-anon-key-kosaann';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
