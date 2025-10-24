// Check connection status
chrome.storage.local.get(['authToken'], (result) => {
  const statusEl = document.getElementById('status');
  if (result.authToken) {
    statusEl.textContent = 'Connected to GitFlow AI';
    statusEl.className = 'status connected';
  } else {
    statusEl.textContent = 'Not connected';
    statusEl.className = 'status disconnected';
  }
});
