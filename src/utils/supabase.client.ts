import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('SUPABASE_URL ou SUPABASE_KEY non défini. Le stockage Supabase ne fonctionnera pas tant que vous n\'aurez pas configuré.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
