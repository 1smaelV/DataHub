/**
 * DataHub - SPA Page Navigation & Routing
 */

const PAGE_TITLES = {
  'home': 'Home',
  'what-is': 'What is Databricks?',
  'framework': 'Framework Architecture',
  'usage': 'How to Use',
  'projects': 'Active Projects',
  'training': 'Training',
  'faq': 'Frequently Asked Questions',
  'presales': 'Pre-Sales',
  'solutioning': 'Solutioning',
  'design': 'Design',
  'delivery': 'Delivery',
  'pov': 'Proof of Value',
  'demo': 'Demo',
  'environments': 'Environments',
  'certifications': 'Certifications',
  'glossary': 'Glossary',
  'bestpractices': 'Best Practices',
  'quickref': 'Quick Reference',
  'about': 'About',
  // Backward compatibility aliases
  'inicio': 'Home',
  'que-es': 'What is Databricks?',
  'uso': 'How to Use',
  'proyectos': 'Active Projects',
  'capacitacion': 'Training'
};

const PAGE_ALIASES = {
  'inicio': 'home',
  'que-es': 'what-is',
  'uso': 'usage',
  'proyectos': 'projects',
  'capacitacion': 'training'
};

function showPage(pageId, updateHash = true) {
  if (!pageId) pageId = 'home';
  
  // Normalize pageId (e.g. #page-home or #home)
  pageId = pageId.replace(/^#/, '').replace(/^page-/, '');

  // Resolve alias if old Spanish identifier is used
  if (PAGE_ALIASES[pageId]) {
    pageId = PAGE_ALIASES[pageId];
  }

  const targetPage = document.getElementById('page-' + pageId);
  if (!targetPage) {
    console.warn('Page target not found:', pageId);
    return;
  }

  // Deactivate current pages and nav items
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Activate target page
  targetPage.classList.add('active');

  // Update topbar breadcrumb
  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle) {
    topbarTitle.textContent = PAGE_TITLES[pageId] || pageId.charAt(0).toUpperCase() + pageId.slice(1);
  }

  // Highlight active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    const onclickAttr = item.getAttribute('onclick') || '';
    if (onclickAttr.includes(`'${pageId}'`) || onclickAttr.includes(`"${pageId}"`)) {
      item.classList.add('active');
    }
  });

  // Sync hash in URL without jump
  if (updateHash && window.history.pushState) {
    window.history.pushState(null, null, '#' + pageId);
  }

  // Smooth scroll to top of view
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render any Lucide icons on the active page
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

// Handle browser Back / Forward buttons
window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    showPage(hash, false);
  } else {
    showPage('home', false);
  }
});
