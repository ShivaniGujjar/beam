const { createClient } = require('@supabase/supabase-js');

// 💡 Validation: Ensure environment variables are present before creating the client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ STORAGE ERROR: SUPABASE_URL or SUPABASE_KEY is missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;