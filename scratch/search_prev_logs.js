const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\fahim\\.gemini\\antigravity\\brain';
const dirs = fs.readdirSync(brainDir);

for (const d of dirs) {
  const logFile = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
  if (fs.existsSync(logFile)) {
    const content = fs.readFileSync(logFile, 'utf8');
    const matches = content.match(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g);
    if (matches) {
      console.log(`Found JWT in ${d}:`, Array.from(new Set(matches)));
    }
  }
}
