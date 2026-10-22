const https = require('https');
const fs = require('fs');

let url = '';
let key = '';

try {
  const envText = fs.readFileSync('frontend/.env', 'utf8');
  envText.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
  });
} catch (e) {}

console.log('Supabase URL:', url);
console.log('Key present:', !!key);

if (!url || !key) {
  process.exit(1);
}

const hostname = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: hostname,
      path: path,
      method: method,
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch(e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(dataString);
    req.end();
  });
}

async function run() {
  console.log('\n--- 1. GET /rest/v1/blogs ---');
  const getRes = await makeRequest('GET', '/rest/v1/blogs?select=id,title,category,status');
  console.log('Status:', getRes.status);
  console.log('Blogs in DB:', getRes.body);

  const testId = '/test-rest-' + Date.now();
  console.log('\n--- 2. POST /rest/v1/blogs (Insert) ---');
  const insRes = await makeRequest('POST', '/rest/v1/blogs', {
    id: testId,
    title: 'Test REST Title',
    content: '<!-- metadata: {} -->',
    category: '__landing_page__',
    status: 'published'
  });
  console.log('Status:', insRes.status);
  console.log('Inserted:', insRes.body);

  if (insRes.status === 201) {
    console.log('\n--- 3. PATCH /rest/v1/blogs?id=eq.' + encodeURIComponent(testId) + ' (Update) ---');
    const updRes = await makeRequest('PATCH', '/rest/v1/blogs?id=eq.' + encodeURIComponent(testId), {
      title: 'Updated REST Title'
    });
    console.log('Status:', updRes.status);
    console.log('Updated:', updRes.body);

    console.log('\n--- 4. DELETE /rest/v1/blogs?id=eq.' + encodeURIComponent(testId) + ' (Delete) ---');
    const delRes = await makeRequest('DELETE', '/rest/v1/blogs?id=eq.' + encodeURIComponent(testId));
    console.log('Status:', delRes.status);
    console.log('Deleted:', delRes.body);
  }
}

run();
