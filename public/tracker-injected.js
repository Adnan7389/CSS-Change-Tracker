/**
 * This script is injected into the inspected page's context.
 * It tracks CSS changes and sends them to the content script.
 */
(() => {
  console.log('CSS Change Tracker: Injected script loaded.');

  // --- Helper function to get a unique selector for an element ---
  const getSelector = (el) => {
    if (!(el instanceof Element)) return;
    let path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break; // IDs are unique, no need to go further
      }
      let sib = el, nth = 1;
      while (sib = sib.previousElementSibling) {
        if (sib.nodeName.toLowerCase() == selector) nth++;
      }
      if (nth != 1) selector += ':nth-of-type('+nth+')';
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(' > ');
  };

  // --- 1. Track Inline Style Changes using MutationObserver ---
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const element = mutation.target;
        const newStyles = element.style.cssText;
        const selector = getSelector(element);

        if (selector) {
          window.postMessage({
            type: 'CSS_CHANGE_TRACKER_STYLE_CHANGED',
            payload: {
              selector,
              style: newStyles,
            },
          }, '*');
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true,
  });

  // --- 2. Track Stylesheet Edits by patching CSSOM methods ---
  const originalInsertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function(rule, index) {
    // Post message with the new rule
    window.postMessage({
      type: 'CSS_CHANGE_TRACKER_RULE_ADDED',
      payload: {
        rule,
        index,
        // We can't easily get the selector of the stylesheet, so we'll handle this in the panel
      },
    }, '*');
    return originalInsertRule.call(this, rule, index);
  };

  const originalDeleteRule = CSSStyleSheet.prototype.deleteRule;
  CSSStyleSheet.prototype.deleteRule = function(index) {
    // This is harder to track meaningfully without knowing the rule content beforehand
    // For this MVP, we will focus on additions and inline edits.
    console.log(`CSS rule deleted at index: ${index}. Deletion tracking not fully implemented in MVP.`);
    return originalDeleteRule.call(this, index);
  };

  // Inform the content script that the tracker is ready.
  window.postMessage({ type: 'CSS_CHANGE_TRACKER_READY' }, '*');

})();
