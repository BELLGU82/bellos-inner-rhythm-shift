// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eryeepncztmywupdgykm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeWVlcG5jenRteXd1cGRneWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjYzMzMsImV4cCI6MjA1OTc0MjMzM30.8Gk79S3azV2F2_0EIo8ZQI_SLGOnWuUCymY77h1YFrs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);