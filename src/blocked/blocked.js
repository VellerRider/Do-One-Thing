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
  if (!blockedURL) {
    console.error('No blocked URL found');
    return;
  }
  
  // Show loading state
  const btn = document.getElementById('btn-allow');
  const originalText = btn.textContent;
  btn.textContent = 'Loading...';
  btn.disabled = true;
  
  // Add to temporary whitelist for this session
  chrome.runtime.sendMessage({
    type: 'ALLOW_TEMPORARILY',
    payload: { url: blockedURL }
  }, (response) => {
    if (response && response.success && response.redirectUrl) {
      // Redirect back to the original URL
      window.location.href = response.redirectUrl;
    } else {
      // Show error and restore button
      alert('Failed to allow site. Please try again.');
      btn.textContent = originalText;
      btn.disabled = false;
      console.error('Failed to allow temporarily:', response?.error);
    }
  });
}

// Add event listeners to buttons (no inline onclick handlers)
document.addEventListener('DOMContentLoaded', () => {
  const btnAllow = document.getElementById('btn-allow');
  
  if (btnAllow) {
    btnAllow.addEventListener('click', allowTemporarily);
  }
});
