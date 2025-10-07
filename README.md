# CSS Change Tracker

This is a Chrome DevTools extension that tracks CSS changes made in the Elements panel, displays them in a custom panel, and allows you to generate a CSS snippet from them.

This is an MVP built with React (Vite) and Manifest V3.

## Features

- **Live Tracking**: See inline style changes in real-time.
- **Save Experiments**: Save a set of changes to `chrome.storage.local`.
- **Generate Snippets**: Create a minimal, copyable CSS snippet from the tracked changes.

## How to Build and Install

### 1. Prerequisites

You must have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### 2. Install Dependencies

Navigate to the project directory in your terminal and run:

```bash
npm install
```

### 3. Build the Extension

Run the build command:

```bash
npm run build
```

This will create a `dist` directory containing the bundled extension files.

### 4. Create Placeholder Icons

This project references three icon files that you need to create. You can use any simple PNG images.

- `public/icons/icon16.png` (16x16 pixels)
- `public/icons/icon48.png` (48x48 pixels)
- `public/icons/icon128.png` (128x128 pixels)

Create these files inside the `CSS-Change-Tracker/public/icons/` directory before loading the extension.

### 5. Load the Extension in Chrome

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** using the toggle in the top-right corner.
3.  Click the **"Load unpacked"** button.
4.  Select the `CSS-Change-Tracker/dist` directory.
5.  The extension should now be loaded!

## How to Use

1.  Open DevTools on any webpage.
2.  Find and click on the **"CSS Tracker"** panel.
3.  Go to the **Elements** panel and change some CSS (e.g., add an inline `style="color: red;"` to an element).
4.  The change will appear in the "Live Changes" section of the CSS Tracker panel.
5.  You can save the current set of changes as an "experiment" or generate a CSS snippet to your clipboard.
