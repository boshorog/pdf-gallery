import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

/**
 * Custom plugin to create .pro-build marker file for Pro builds
 * This marker is detected by PHP to configure Freemius with is_premium=true
 */
const proBuildMarker = () => ({
  name: 'pro-build-marker',
  closeBundle() {
    const isPro = process.env.VITE_BUILD_VARIANT === 'pro';
    const markerPath = path.resolve(__dirname, 'dist/.pro-build');
    const phpPath = path.resolve(__dirname, 'kindpixels-pdf-gallery.php');
    
    if (isPro) {
      // Create marker file for Pro build
      fs.writeFileSync(markerPath, 'pro');
      console.log('✓ Created .pro-build marker for Pro version');
      
      // Update PHP header to show "PDF Gallery Pro" for Pro builds
      if (fs.existsSync(phpPath)) {
        let phpContent = fs.readFileSync(phpPath, 'utf8');
        // Change plugin name to "PDF Gallery Pro" (remove KindPixels prefix)
        phpContent = phpContent.replace(
          /Plugin Name:\s*KindPixels PDF Gallery\s*$/m,
          'Plugin Name: PDF Gallery Pro'
        );
        fs.writeFileSync(phpPath, phpContent, 'utf8');
        console.log('✓ Updated plugin header to "PDF Gallery Pro"');
      }
    } else {
      // Ensure no marker exists for Free build
      if (fs.existsSync(markerPath)) {
        fs.unlinkSync(markerPath);
      }
      
      // Restore original plugin name for Free builds
      if (fs.existsSync(phpPath)) {
        let phpContent = fs.readFileSync(phpPath, 'utf8');
        phpContent = phpContent.replace(
          /Plugin Name:\s*PDF Gallery Pro\s*$/m,
          'Plugin Name: KindPixels PDF Gallery'
        );
        fs.writeFileSync(phpPath, phpContent, 'utf8');
      }
      console.log('✓ Free version build (no .pro-build marker)');
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/wp-content/plugins/kindpixels-pdf-gallery/dist/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'production' && proBuildMarker(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Use predictable filenames for WordPress integration
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    // Copy public files to dist, but hidden files will be excluded by WordPress plugin check
    copyPublicDir: false
  }
}));
