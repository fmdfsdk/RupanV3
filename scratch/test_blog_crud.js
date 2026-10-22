const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment or VITE_SUPABASE keys
let url = process.env.VITE_SUPABASE_URL || '';
let key = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  // Try reading from .env or frontend/.env
  try {
    const envText = fs.readFileSync('frontend/.env', 'utf8');
    envText.split('\n').forEach(line => {
      if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
      if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
    });
  } catch (e) {}
}

console.log('Supabase URL:', url);
console.log('Supabase Anon Key present:', !!key);

if (!url || !key) {
  console.log('Keys missing, exiting script');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testCrud() {
  console.log('\n--- 1. Fetching all blogs from Supabase ---');
  const { data: blogs, error: fetchErr } = await supabase.from('blogs').select('*');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }
  console.log(`Found ${blogs ? blogs.length : 0} blogs:`);
  blogs.forEach(b => console.log(` - ID: "${b.id}" | Title: "${b.title}" | Category: "${b.category}"`));

  console.log('\n--- 2. Testing Insert ---');
  const testId = '/test-crud-landing-' + Date.now();
  const insertPayload = {
    id: testId,
    title: 'Test CRUD Landing Page',
    content: '<!-- metadata: {"layout":"blank","seoEnabled":true,"marketingEnabled":true} -->\n<h1>Test</h1>',
    category: '__landing_page__',
    status: 'published'
  };
  const { data: inserted, error: insErr } = await supabase.from('blogs').insert([insertPayload]).select();
  console.log('Insert Error:', insErr);
  console.log('Inserted Data:', inserted);

  if (inserted && inserted.length > 0) {
    console.log('\n--- 3. Testing Update ---');
    const { data: updated, error: updErr } = await supabase
      .from('blogs')
      .update({ title: 'Updated Test Title' })
      .eq('id', testId)
      .select();
    console.log('Update Error:', updErr);
    console.log('Updated Data:', updated);

    console.log('\n--- 4. Testing Delete ---');
    const { data: deleted, error: delErr } = await supabase
      .from('blogs')
      .delete()
      .eq('id', testId)
      .select();
    console.log('Delete Error:', delErr);
    console.log('Deleted Data:', deleted);
  }
}

testCrud();
