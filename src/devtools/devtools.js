// This script creates the custom panel in the DevTools.

// Create a new panel
chrome.devtools.panels.create(
  "CSS Tracker", // Panel title
  "public/icons/icon16.png", // Panel icon
  "dist/src/devtools/panel/index.html", // Panel HTML file
  (panel) => {
    // You can add logic here that runs when the panel is created.
    // For example, listening to panel-specific events.
    panel.onShown.addListener((window) => {
        // console.log("Panel shown");
    });
  }
);
