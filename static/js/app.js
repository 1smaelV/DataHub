/**
 * DataHub - Application Entrypoint
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check hash on startup
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    showPage(initialHash, false);
  } else {
    showPage('home', false);
  }

  // Initialize components
  if (typeof initSearch === 'function') {
    initSearch();
  }

  if (typeof initCodeCopy === 'function') {
    initCodeCopy();
  }

  // Initialize Lucide Icons
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }

  console.log('🚀 DataHub Internal Portal initialized successfully with Lucide Icons');
});

