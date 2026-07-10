const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log("No Supabase URL/Key found in env.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('blogs').select('id, title, status');
  if (error) {
    console.error("Error fetching blogs:", error.message);
  } else {
    console.log("Blogs list:", data);
  }
}
run();
