const path = require('path');
const fs = require('fs');

// 💡 1. Ensure dotenv is loaded before reading process.env
const possiblePaths = [
    path.resolve(__dirname, '../../.env'), 
    path.resolve(__dirname, '../.env'),    
    path.resolve(process.cwd(), '.env'),    
];

for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        break;
    }
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : null;
const supabaseKey = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : null;

console.log("🔍 [STORAGE CONFIG DEBUG]");
console.log("URL:", supabaseUrl ? `Loaded (${supabaseUrl})` : "MISSING ❌");
console.log("KEY:", supabaseKey ? "Loaded ✅" : "MISSING ❌");

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ STORAGE ERROR: SUPABASE_URL or SUPABASE_KEY missing in .env!");
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

module.exports = supabase;