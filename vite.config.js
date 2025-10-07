import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Our extension's structure requires multiple entry points.
    // Vite needs to know where to start bundling and what to name the output files.
    rollupOptions: {
      input: {
        // The devtools page, which creates the panel
        devtools: resolve(__dirname, 'src/devtools/devtools.html'),
        // The panel itself, which is a React app
        panel: resolve(__dirname, 'src/devtools/panel/index.html'),
      },
      output: {
        // Configure the output file names.
        // We want to keep the original names and directory structure.
        entryFileNames: `src/[name]/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: (assetInfo) => {
          // Keep the original name for CSS files
          if (assetInfo.name.endsWith('.css')) {
            return 'src/devtools/panel/App.css';
          }
          return 'assets/[name].[ext]';
        },
      }
    },
    // The output directory for the build
    outDir: 'dist',
    // Minification can sometimes cause issues with extensions, so we disable it for the build.
    // It also makes debugging easier.
    minify: false,
  },
});
