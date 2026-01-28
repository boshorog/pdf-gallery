#!/usr/bin/env node

/**
 * PDF Gallery Plugin Build Script
 * 
 * Builds and packages both Free and Pro variants of the plugin.
 * 
 * Usage:
 *   node scripts/build-plugin.js          # Build both variants
 *   node scripts/build-plugin.js free     # Build Free only
 *   node scripts/build-plugin.js pro      # Build Pro only
 * 
 * Output:
 *   dist/kindpixels-pdf-gallery-free-{version}.zip
 *   dist/kindpixels-pdf-gallery-pro-{version}.zip
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Plugin configuration
const PLUGIN_SLUG = 'kindpixels-pdf-gallery';
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_DIR = path.join(ROOT_DIR, 'releases');

// Files/folders to include in the ZIP (relative to project root)
const INCLUDE_FILES = [
  'kindpixels-pdf-gallery.php',
  'readme.txt',
  'dist/',
  'freemius/',  // Freemius SDK (if exists)
  'vendor/',    // Freemius SDK alternate location
];

// Files/folders to exclude
const EXCLUDE_PATTERNS = [
  '.pro-build',  // Will be handled per variant
  '.DS_Store',
  'Thumbs.db',
  '*.map',
];

/**
 * Get plugin version from main PHP file
 */
function getPluginVersion() {
  const phpFile = path.join(ROOT_DIR, 'kindpixels-pdf-gallery.php');
  const content = fs.readFileSync(phpFile, 'utf8');
  const match = content.match(/Version:\s*([0-9.]+)/i);
  if (!match) {
    throw new Error('Could not find version in kindpixels-pdf-gallery.php');
  }
  return match[1];
}

/**
 * Run a shell command
 */
function run(command, description) {
  console.log(`\n📦 ${description}...`);
  console.log(`   $ ${command}`);
  try {
    execSync(command, { 
      cwd: ROOT_DIR, 
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    process.exit(1);
  }
}

/**
 * Create ZIP archive
 */
async function createZip(variant, version) {
  const zipName = `${PLUGIN_SLUG}-${variant}-${version}.zip`;
  const zipPath = path.join(OUTPUT_DIR, zipName);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Remove existing ZIP if present
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  console.log(`\n📦 Creating ${zipName}...`);
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`   ✅ Created: ${zipName} (${sizeMB} MB)`);
      resolve(zipPath);
    });
    
    archive.on('error', reject);
    archive.pipe(output);
    
    // Add files with plugin slug as root folder
    INCLUDE_FILES.forEach(file => {
      const fullPath = path.join(ROOT_DIR, file);
      if (!fs.existsSync(fullPath)) {
        // Skip missing optional files (like freemius/)
        if (file !== 'freemius/') {
          console.log(`   ⚠️  Skipping missing: ${file}`);
        }
        return;
      }
      
      const stat = fs.statSync(fullPath);
      const destPath = `${PLUGIN_SLUG}/${file}`;
      
      if (stat.isDirectory()) {
        archive.directory(fullPath, destPath, data => {
          // Filter out excluded patterns
          const name = data.name || '';
          for (const pattern of EXCLUDE_PATTERNS) {
            if (pattern.startsWith('*')) {
              if (name.endsWith(pattern.slice(1))) return false;
            } else if (name.includes(pattern)) {
              return false;
            }
          }
          return data;
        });
      } else {
        archive.file(fullPath, { name: destPath });
      }
    });
    
    // For Pro variant, ensure .pro-build marker is included
    if (variant === 'pro') {
      const proMarker = path.join(DIST_DIR, '.pro-build');
      if (fs.existsSync(proMarker)) {
        archive.file(proMarker, { name: `${PLUGIN_SLUG}/dist/.pro-build` });
      }
    }
    
    archive.finalize();
  });
}

/**
 * Build a specific variant
 */
async function buildVariant(variant, version) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🔨 Building ${variant.toUpperCase()} variant (v${version})`);
  console.log('='.repeat(50));
  
  // Run the appropriate build command
  run(`npm run build:${variant}`, `Building ${variant} assets`);
  
  // Create ZIP
  const zipPath = await createZip(variant, version);
  
  return zipPath;
}

/**
 * Main build function
 */
async function main() {
  const args = process.argv.slice(2);
  const variant = args[0]?.toLowerCase();
  
  // Validate variant argument
  if (variant && !['free', 'pro'].includes(variant)) {
    console.error('❌ Invalid variant. Use: free, pro, or no argument for both');
    process.exit(1);
  }
  
  // Check for archiver dependency
  try {
    require.resolve('archiver');
  } catch {
    console.log('📦 Installing archiver dependency...');
    run('npm install --save-dev archiver', 'Installing archiver');
  }
  
  const version = getPluginVersion();
  console.log(`\n🚀 PDF Gallery Plugin Builder`);
  console.log(`   Version: ${version}`);
  console.log(`   Output:  ${OUTPUT_DIR}`);
  
  const results = [];
  
  if (!variant || variant === 'free') {
    results.push(await buildVariant('free', version));
  }
  
  if (!variant || variant === 'pro') {
    results.push(await buildVariant('pro', version));
  }
  
  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('✅ Build Complete!');
  console.log('='.repeat(50));
  console.log('\nGenerated files:');
  results.forEach(zipPath => {
    console.log(`   📦 ${path.basename(zipPath)}`);
  });
  
  console.log('\nNext steps:');
  if (results.some(p => p.includes('-free-'))) {
    console.log('   • Free ZIP → Upload to WordPress.org');
  }
  if (results.some(p => p.includes('-pro-'))) {
    console.log('   • Pro ZIP  → Upload to Freemius Dashboard → Deployment → Add Version');
  }
  console.log('');
}

// Run
main().catch(error => {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
});
