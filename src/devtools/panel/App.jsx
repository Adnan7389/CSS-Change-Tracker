import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [changes, setChanges] = useState({});
  const [experiments, setExperiments] = useState([]);
  const [status, setStatus] = useState('Initializing...');

  // --- 1. Inject the tracking script and set up communication ---
  useEffect(() => {
    // Establish connection with the background script
    const port = chrome.runtime.connect({
      name: String(chrome.devtools.inspectedWindow.tabId),
    });

    setStatus('Injecting tracker script...');

    // Inject the tracker script into the inspected page
    const scriptUrl = chrome.runtime.getURL('public/tracker-injected.js');
    chrome.devtools.inspectedWindow.eval(
      `
      const script = document.createElement('script');
      script.src = "${scriptUrl}";
      document.head.appendChild(script);
      script.onload = () => script.remove();
      `,
      (result, isException) => {
        if (isException) {
          console.error('Failed to inject script:', isException);
          setStatus('Error: Could not inject tracker.');
        } else {
          setStatus('Tracker injected. Listening for changes...');
        }
      }
    );

    // Listen for messages from the background script
    port.onMessage.addListener((message) => {
      if (message.type === 'CSS_CHANGE_TRACKER_STYLE_CHANGED') {
        const { selector, style } = message.payload;
        setChanges(prev => ({ ...prev, [selector]: { style } }));
      }
      // NOTE: RULE_ADDED is not fully handled in this MVP to keep it simple
      // A full implementation would need to parse the rule and associate it with a stylesheet.
    });

    // Load saved experiments on component mount
    loadExperiments();

    return () => port.disconnect();
  }, []);

  // --- 2. Functions to manage experiments (Save, Load, Clear) ---
  const saveExperiment = useCallback(() => {
    if (Object.keys(changes).length === 0) return;
    const newExperiment = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      changes,
    };
    chrome.storage.local.get('experiments', (data) => {
      const existing = data.experiments || [];
      const updated = [newExperiment, ...existing];
      chrome.storage.local.set({ experiments: updated }, () => {
        setExperiments(updated);
        setChanges({}); // Clear current changes after saving
        setStatus(`Experiment saved at ${newExperiment.timestamp}`);
      });
    });
  }, [changes]);

  const loadExperiments = () => {
    chrome.storage.local.get('experiments', (data) => {
      if (data.experiments) {
        setExperiments(data.experiments);
      }
    });
  };

  const clearAllExperiments = () => {
    chrome.storage.local.set({ experiments: [] }, () => {
      setExperiments([]);
      setStatus('All saved experiments cleared.');
    });
  };

  const loadSpecificExperiment = (experimentChanges) => {
    setChanges(experimentChanges);
    setStatus('Loaded saved experiment. You can now generate a snippet.');
  };

  // --- 3. Function to generate and copy CSS snippet ---
  const generateSnippet = useCallback(() => {
    if (Object.keys(changes).length === 0) {
      setStatus('No changes to generate snippet from.');
      return;
    }

    const snippet = Object.entries(changes)
      .map(([selector, { style }]) => {
        // The style can be a string of CSS text. We need to format it.
        const formattedStyle = style
          .split(';')
          .map(s => s.trim())
          .filter(s => s)
          .join('\n  ');
        return `${selector} {
  ${formattedStyle}
}`;
      })
      .join('\n\n');

    // Copy to clipboard
    navigator.clipboard.writeText(snippet).then(() => {
      setStatus('CSS snippet copied to clipboard!');
    }, () => {
      setStatus('Failed to copy snippet.');
    });
  }, [changes]);

  return (
    <div className="app-container">
      <header>
        <h1>CSS Change Tracker</h1>
        <p className="status">{status}</p>
      </header>

      <div className="main-controls">
        <button onClick={saveExperiment} disabled={Object.keys(changes).length === 0}>
          💾 Save Current Changes
        </button>
        <button onClick={generateSnippet} disabled={Object.keys(changes).length === 0}>
          📋 Generate & Copy Snippet
        </button>
      </div>

      <div className="content-section">
        <div className="live-changes">
          <h2>Live Changes</h2>
          {Object.keys(changes).length > 0 ? (
            <pre>{JSON.stringify(changes, null, 2)}</pre>
          ) : (
            <p>Make a change in the Elements panel to see it here.</p>
          )}
        </div>

        <div className="saved-experiments">
          <h2>Saved Experiments</h2>
          {experiments.length > 0 ? (
            <>
              <button onClick={clearAllExperiments} className="clear-btn">Clear All</button>
              <ul>
                {experiments.map(exp => (
                  <li key={exp.id}>
                    <span>{exp.timestamp}</span>
                    <button onClick={() => loadSpecificExperiment(exp.changes)}>Load</button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No saved experiments yet.</p>
          ) }
        </div>
      </div>
    </div>
  );
}

export default App;
