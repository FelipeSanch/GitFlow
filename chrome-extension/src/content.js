// GitFlow AI Chrome Extension - Content Script

console.log('GitFlow AI Extension - Content script loaded');

// Detect if we're on a PR page
function isPullRequestPage() {
  return window.location.pathname.includes('/pull/');
}

// Detect if we're on a repository page
function isRepositoryPage() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  return pathParts.length >= 2 && !pathParts.includes('pulls') && !pathParts.includes('issues');
}

// Extract PR data from the page
function extractPRData() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const owner = pathParts[0];
  const repo = pathParts[1];
  const prNumber = pathParts[3];

  const titleElement = document.querySelector('.js-issue-title');
  const title = titleElement?.textContent?.trim() || '';

  const filesChangedElement = document.querySelector('.diffbar-item:first-child .text-emphasized');
  const filesChanged = filesChangedElement?.textContent?.trim() || '0';

  const additionsElement = document.querySelector('.diffstat-summary .color-fg-success');
  const additions = additionsElement?.textContent?.replace(/[^0-9]/g, '') || '0';

  const deletionsElement = document.querySelector('.diffstat-summary .color-fg-danger');
  const deletions = deletionsElement?.textContent?.replace(/[^0-9]/g, '') || '0';

  return {
    owner,
    repo,
    prNumber: parseInt(prNumber),
    title,
    filesChanged: parseInt(filesChanged),
    additions: parseInt(additions),
    deletions: parseInt(deletions),
    url: window.location.href
  };
}

// Add prediction banner to PR page
function addPredictionBanner(prediction) {
  // Remove existing banner if present
  const existing = document.querySelector('#gitflow-prediction-banner');
  if (existing) {
    existing.remove();
  }

  const banner = document.createElement('div');
  banner.id = 'gitflow-prediction-banner';
  banner.className = 'gitflow-banner';

  const { confidence, prediction: outcome } = prediction;
  const isHighRisk = outcome === 'conflict' && confidence > 0.7;

  banner.innerHTML = `
    <div class="gitflow-banner-content ${isHighRisk ? 'high-risk' : 'low-risk'}">
      <div class="gitflow-icon">${isHighRisk ? '⚠️' : '✅'}</div>
      <div class="gitflow-text">
        <strong>GitFlow AI Prediction:</strong>
        ${isHighRisk
          ? `High risk of merge conflicts (${(confidence * 100).toFixed(1)}% confidence)`
          : `Low risk of merge conflicts (${((1 - confidence) * 100).toFixed(1)}% confidence)`
        }
      </div>
      <a href="http://localhost:5173" target="_blank" class="gitflow-link">View Details →</a>
    </div>
  `;

  const discussion = document.querySelector('.discussion-timeline');
  if (discussion) {
    discussion.insertBefore(banner, discussion.firstChild);
  }
}

// Request prediction from backend
async function requestPrediction() {
  const prData = extractPRData();

  chrome.runtime.sendMessage(
    { type: 'GET_PREDICTION', data: prData },
    (response) => {
      if (response.success && response.prediction) {
        addPredictionBanner(response.prediction);
      }
    }
  );
}

// Send repository data to backend
function sendRepositoryData() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const owner = pathParts[0];
  const repo = pathParts[1];

  const repoData = {
    type: 'REPOSITORY_VIEW',
    owner,
    repo,
    url: window.location.href,
    timestamp: Date.now()
  };

  chrome.runtime.sendMessage({ type: 'GITHUB_DATA', data: repoData });
}

// Initialize extension on page
function initialize() {
  if (isPullRequestPage()) {
    console.log('GitFlow AI: Pull request page detected');
    requestPrediction();
  } else if (isRepositoryPage()) {
    console.log('GitFlow AI: Repository page detected');
    sendRepositoryData();
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PAGE_LOADED') {
    initialize();
  }
});

// Initialize on load
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}
