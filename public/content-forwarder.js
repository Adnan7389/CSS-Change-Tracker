// This content script acts as a simple forwarder.
// It listens for messages from the injected script (tracker-injected.js)
// and forwards them to the background script.

// Listen for messages from the page (sent via window.postMessage).
window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  const message = event.data;

  // Check if the message is one of ours.
  if (message.type && message.type.startsWith('CSS_CHANGE_TRACKER_')) {
    // Forward the message to the background script.
    chrome.runtime.sendMessage(message);
  }
}, false);
