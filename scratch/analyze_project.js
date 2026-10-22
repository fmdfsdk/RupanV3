const fs = require('fs');
const path = require('path');

function getDirectoryStats(dirPath, excludePattern = null) {
  let totalBytes = 0;
  let totalFiles = 0;

  function walk(currentDir) {
    if (excludePattern && excludePattern.test(currentDir)) return;
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile()) {
          totalBytes += stat.size;
          totalFiles++;
        }
      }
    } catch (e) {}
  }

  walk(dirPath);
  return { bytes: totalBytes, files: totalFiles };
}

function countLinesOfCode(dirs, extensions) {
  let totalLines = 0;
  let totalFiles = 0;

  function walk(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            totalLines += lines;
            totalFiles++;
          }
        }
      }
    } catch (e) {}
  }

  for (const dir of dirs) {
    walk(dir);
  }

  return { lines: totalLines, files: totalFiles };
}

const frontendStats = getDirectoryStats('frontend', /node_modules|dist|\.git/);
const adminStats = getDirectoryStats('admin', /node_modules|dist|\.git/);
const sharedStats = getDirectoryStats('shared');
const assetsStats = getDirectoryStats('frontend/public/assets');
const codeStats = countLinesOfCode(['frontend/src', 'admin/src', 'shared'], ['.ts', '.tsx']);

console.log('--- PROJECT ANALYSIS ---');
console.log(`Frontend Source Size:   ${(frontendStats.bytes / 1024).toFixed(2)} KB (${frontendStats.files} files)`);
console.log(`Admin Source Size:      ${(adminStats.bytes / 1024).toFixed(2)} KB (${adminStats.files} files)`);
console.log(`Shared Source Size:     ${(sharedStats.bytes / 1024).toFixed(2)} KB (${sharedStats.files} files)`);
console.log(`Asset Files Size:       ${(assetsStats.bytes / (1024 * 1024)).toFixed(2)} MB (${assetsStats.files} files)`);
console.log(`Total Source Code:      ${codeStats.lines} lines of TypeScript across ${codeStats.files} .ts/.tsx files.`);
