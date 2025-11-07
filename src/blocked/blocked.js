// Parse URL parameters
const params = new URLSearchParams(window.location.search);
const blockedURL = params.get('url');
const reason = params.get('reason');

if (reason) {
  document.getElementById('reason').textContent = reason;
}

// Load session info and suggestions
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  if (response.success && response.session) {
    document.getElementById('intent').textContent = 
      `Stay focused on: ${response.session.intent}`;
    
    // Show suggested websites
    const suggestionsContainer = document.getElementById('suggestions-list');
    const suggestions = response.session.rules.allowedDomains.slice(0, 5);
    
    if (suggestions.length > 0) {
      suggestions.forEach(domain => {
        const link = document.createElement('a');
        link.href = `https://${domain}`;
        link.textContent = domain;
        suggestionsContainer.appendChild(link);
      });
    } else {
      suggestionsContainer.innerHTML = '<p style="color: white; opacity: 0.8;">No suggestions available</p>';
    }
  }
});

function allowTemporarily() {
  const confirmReason = prompt('Why do you need to access this site?\n(This will help improve future filtering)');
  
  if (confirmReason && blockedURL) {
    // Add to whitelist temporarily
    chrome.runtime.sendMessage({
      type: 'ALLOW_TEMPORARILY',
      payload: { url: blockedURL, reason: confirmReason }
    }, () => {
      window.location.href = blockedURL;
    });
  }
}

function goBack() {
  history.back();
}

// Export functions to window for onclick handlers
window.allowTemporarily = allowTemporarily;
window.goBack = goBack;
