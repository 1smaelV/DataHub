/**
 * DataHub - Component Interactions: FAQ, Search, Clipboard & Toast
 */

// Accordion toggle for FAQ and Glossary items
function toggleFaq(el) {
  const item = el.parentElement;
  const wasOpen = item.classList.contains('open');
  
  // Close other open items in the same container
  const container = item.closest('.page') || document;
  container.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  
  if (!wasOpen) {
    item.classList.add('open');
  }
}

// Topbar Search filter
function initSearch() {
  const searchInput = document.querySelector('.search-box input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;

    if (!query) {
      // Reset visibility
      activePage.querySelectorAll('.card, .faq-item, tr').forEach(el => {
        el.style.display = '';
      });
      return;
    }

    // Filter cards and faq items in active page
    activePage.querySelectorAll('.card, .faq-item').forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(query) ? '' : 'none';
    });

    // Filter table rows
    activePage.querySelectorAll('tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

// Copy to clipboard with toast notification
function initCodeCopy() {
  document.querySelectorAll('.code-block').forEach((block) => {
    // Check if copy button already exists
    if (block.querySelector('.copy-btn')) return;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border);
      color: var(--muted);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    `;

    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.style.color = 'var(--text)';
      copyBtn.style.background = 'rgba(255, 255, 255, 0.15)';
    });
    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.style.color = 'var(--muted)';
      copyBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    });

    copyBtn.addEventListener('click', () => {
      // Clone block and remove meta elements like lang and copy btn
      const clone = block.cloneNode(true);
      const btn = clone.querySelector('button');
      if (btn) btn.remove();
      const lang = clone.querySelector('.code-lang');
      if (lang) lang.remove();

      const text = clone.innerText.trim();
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.style.color = 'var(--accent2)';
        setTimeout(() => {
          copyBtn.innerHTML = '📋 Copy';
          copyBtn.style.color = 'var(--muted)';
        }, 2000);
      });
    });

    block.style.position = 'relative';
    block.appendChild(copyBtn);
  });
}
