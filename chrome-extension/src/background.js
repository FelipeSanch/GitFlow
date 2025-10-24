// GitFlow AI Chrome Extension - Background Service Worker

const API_URL = 'http://localhost:3001/api';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GITHUB_DATA') {
    handleGitHubData(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }

  if (request.type === 'GET_PREDICTION') {
    getPrediction(request.data)
      .then(prediction => sendResponse({ success: true, prediction }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Send GitHub data to backend
async function handleGitHubData(data) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/analytics/github-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to send data to backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending GitHub data:', error);
    throw error;
  }
}

// Get merge conflict prediction
async function getPrediction(prData) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/ml/predict-conflicts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(prData)
    });

    if (!response.ok) {
      throw new Error('Failed to get prediction');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting prediction:', error);
    throw error;
  }
}

// Get stored auth token
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Listen for tab updates to detect GitHub pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('github.com')) {
    chrome.tabs.sendMessage(tabId, { type: 'PAGE_LOADED' });
  }
});

console.log('GitFlow AI Extension - Background service worker initialized');
