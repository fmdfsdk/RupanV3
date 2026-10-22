const fs = require('fs');
const logPath = 'C:\\Users\\fahim\\.gemini\\antigravity\\brain\\77502d66-f59b-49ca-ba31-2fc6a0f27045\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  console.log('File size:', fileContent.length);
  const truncatedIndex = fileContent.indexOf('truncated');
  console.log('Index of word "truncated":', truncatedIndex);
  if (truncatedIndex !== -1) {
    console.log('Snippet around "truncated":', fileContent.substring(truncatedIndex - 50, truncatedIndex + 50));
  }
} catch (e) {
  console.error('Error:', e);
}
