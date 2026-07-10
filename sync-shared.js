const fs = require('fs');
const path = require('path');

// Target Directories
const targets = {
  types: [
    path.join(__dirname, 'frontend', 'src', 'types.ts'),
    path.join(__dirname, 'admin', 'src', 'types.ts')
  ],
  supabase: [
    path.join(__dirname, 'frontend', 'src', 'lib', 'supabase.ts'),
    path.join(__dirname, 'admin', 'src', 'lib', 'supabase.ts')
  ],
  services: [
    path.join(__dirname, 'frontend', 'src', 'services'),
    path.join(__dirname, 'admin', 'src', 'services')
  ]
};

// Sources
const sources = {
  types: path.join(__dirname, 'shared', 'types.ts'),
  supabase: path.join(__dirname, 'shared', 'supabase.ts'),
  services: path.join(__dirname, 'shared', 'services')
};

function syncDirectory(srcDir, destDirs) {
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory does not exist: ${srcDir}`);
    return;
  }
  
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      const subDests = destDirs.map(d => path.join(d, file));
      subDests.forEach(d => {
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      });
      syncDirectory(srcPath, subDests);
    } else {
      const content = fs.readFileSync(srcPath, 'utf8');
      destDirs.forEach(destDir => {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        const destPath = path.join(destDir, file);
        fs.writeFileSync(destPath, content, 'utf8');
        console.log(`Synced: ${path.relative(__dirname, destPath)}`);
      });
    }
  }
}

// Execution
try {
  console.log('--- Synchronizing Shared Codebase Modules ---');
  
  // 1. Types
  if (fs.existsSync(sources.types)) {
    const typesContent = fs.readFileSync(sources.types, 'utf8');
    targets.types.forEach((targetPath) => {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(targetPath, typesContent, 'utf8');
      console.log(`Synced: ${path.relative(__dirname, targetPath)}`);
    });
  } else {
    console.error('Source types file does not exist:', sources.types);
  }

  // 2. Supabase
  if (fs.existsSync(sources.supabase)) {
    const supabaseContent = fs.readFileSync(sources.supabase, 'utf8');
    targets.supabase.forEach((targetPath) => {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(targetPath, supabaseContent, 'utf8');
      console.log(`Synced: ${path.relative(__dirname, targetPath)}`);
    });
  } else {
    console.error('Source supabase file does not exist:', sources.supabase);
  }

  // 3. Services Directory
  if (fs.existsSync(sources.services)) {
    syncDirectory(sources.services, targets.services);
  } else {
    console.log('Source services directory not found (will be created on first service addition)');
  }

  console.log('--- Shared modules synchronization succeeded! ---');
} catch (err) {
  console.error('Shared modules synchronization failed:', err);
  process.exit(1);
}
