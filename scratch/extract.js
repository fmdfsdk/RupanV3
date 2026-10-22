const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\fahim\\.gemini\\antigravity\\brain\\77502d66-f59b-49ca-ba31-2fc6a0f27045\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = path.join(__dirname, 'untruncated_landing.html');

try {
  const line1 = fs.readFileSync(logPath, 'utf8').split('\n')[0];
  const obj = JSON.parse(line1);
  const content = obj.content;
  
  // Find where the HTML starts
  const htmlStartIndex = content.indexOf('<!DOCTYPE html>');
  if (htmlStartIndex === -1) {
    console.error('Could not find HTML start');
    process.exit(1);
  }
  
  // Extract from <!DOCTYPE html> onwards, removing the trailing </USER_REQUEST> if present
  let html = content.substring(htmlStartIndex);
  if (html.endsWith('</USER_REQUEST>')) {
    html = html.substring(0, html.length - '</USER_REQUEST>'.length);
  }
  
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Successfully extracted untruncated HTML to ${outPath}`);
} catch (e) {
  console.error('Error extracting HTML:', e);
}
