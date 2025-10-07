// This script acts as a bridge between the content script and the devtools panel.
// It maintains a connection to the devtools panel for the inspected tab.

// A map to store the connection to the devtools panel, keyed by tab ID.
const connections = {};

// Listen for new connections from devtools panels.
chrome.runtime.onConnect.addListener(function (port) {
  // The port name is expected to be the tab ID.
  const tabId = parseInt(port.name, 10);

  // Store the port for this tab.
  connections[tabId] = port;

  // When the devtools panel disconnects, remove its port from our map.
  port.onDisconnect.addListener(() => {
    delete connections[tabId];
  });

  // Optional: Add a listener for messages from the devtools panel if needed.
  // port.onMessage.addListener((msg) => {
  //   console.log(`Message from devtools for tab ${tabId}:`, msg);
  // });
});

// Listen for messages from the content script (content-forwarder.js).
chrome.runtime.onMessage.addListener((message, sender) => {
  // The sender's tab object contains the tab ID.
  if (sender.tab) {
    const tabId = sender.tab.id;
    // If we have an active connection for this tab, forward the message.
    if (connections[tabId]) {
      connections[tabId].postMessage(message);
    }
  }
  // Return true to indicate that we will respond asynchronously (though we don't here).
  return true;
});
