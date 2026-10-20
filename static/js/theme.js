/**
 * DataHub - Theme Management (Dark / Light)
 */

function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.classList.toggle('light');
  localStorage.setItem('datahub_theme', isLight ? 'light' : 'dark');
}

// Restore saved theme on initialization
(function initTheme() {
  const savedTheme = localStorage.getItem('datahub_theme') || localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
  } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    // Optionally respect system theme if not explicitly set
    // document.documentElement.classList.add('light');
  }
})();
