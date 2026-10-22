/**
 * DataHub - Certifications Page: Leaderboard
 * Fetches certification records from /api/cert-leaderboard once and renders
 * them into #cert-leaderboard-body (templates/pages/certifications.html)
 * with client-side filtering, sorting and pagination.
 */

const CERT_MONO_STYLE = "font-family:'IBM Plex Mono',monospace;font-size:11px";

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Status ordering used when sorting by the Badge column
const CERT_STATUS_ORDER = { certified: 0, expiring: 1, expired: 2 };

// Leaderboard state (all filtering/sorting/paging happens client-side)
const certLb = {
  rows: [],          // full dataset from the API (server order = cert_count desc)
  search: '',
  cert: '',
  status: '',
  sortKey: null,     // null keeps the server ranking order
  sortDir: 'asc',
  page: 1,
  pageSize: 10
};

// Status based on expiry date: certified / expiring (<= 90 days) / expired
function certStatus(expiry) {
  if (!expiry) return 'certified';
  const days = (new Date(expiry) - new Date()) / 86400000;
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring';
  return 'certified';
}

function certBadge(status) {
  if (status === 'expired') {
    return '<span class="tag tag-red"><i data-lucide="x" class="icon-xs" style="stroke-width:3"></i> Expired</span>';
  }
  if (status === 'expiring') {
    return '<span class="tag tag-yellow"><i data-lucide="hourglass" class="icon-xs" style="vertical-align:text-bottom"></i> Expiring soon</span>';
  }
  return '<span class="tag tag-cyan"><i data-lucide="check" class="icon-xs" style="color:var(--accent2);stroke-width:3"></i> Certified</span>';
}

function renderCertMessage(body, message, color) {
  body.innerHTML = '<tr><td colspan="4" style="color:' + color + '">' + message + '</td></tr>';
}

function refreshCertIcons() {
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

// ---- Pipeline: filter -> sort -> paginate -------------------------------

function getFilteredCertRows() {
  const q = certLb.search.toLowerCase();
  return certLb.rows.filter(r =>
    (!q || r.employee_name.toLowerCase().includes(q) || r.certification_name.toLowerCase().includes(q)) &&
    (!certLb.cert || r.certification_name === certLb.cert) &&
    (!certLb.status || r.status === certLb.status)
  );
}

function sortCertRows(rows) {
  if (!certLb.sortKey) return rows;
  const key = certLb.sortKey;
  const dir = certLb.sortDir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    let va = a[key], vb = b[key];
    if (key === 'status') { va = CERT_STATUS_ORDER[va]; vb = CERT_STATUS_ORDER[vb]; }
    if (va == null) return 1;   // nulls always last
    if (vb == null) return -1;
    if (typeof va === 'number') return (va - vb) * dir;
    // ISO dates (YYYY-MM-DD) compare correctly as strings
    return String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' }) * dir;
  });
}

function renderCertLeaderboard() {
  const body = document.getElementById('cert-leaderboard-body');
  if (!body) return;

  const filtered = sortCertRows(getFilteredCertRows());
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / certLb.pageSize));
  certLb.page = Math.min(Math.max(1, certLb.page), pages);
  const start = (certLb.page - 1) * certLb.pageSize;
  const pageRows = filtered.slice(start, start + certLb.pageSize);

  if (!certLb.rows.length) {
    renderCertMessage(body, 'No certifications recorded yet.', 'var(--muted)');
  } else if (!total) {
    renderCertMessage(body, 'No certifications match the current filters.', 'var(--muted)');
  } else {
    body.innerHTML = pageRows.map(r =>
      '<tr><td><strong>' + escapeHtml(r.employee_name) + '</strong>' +
      (r.cert_count > 1 ? ' <span class="tag tag-gray">' + r.cert_count + ' certs</span>' : '') + '</td>' +
      '<td>' + escapeHtml(r.certification_name) + '</td>' +
      '<td style="' + CERT_MONO_STYLE + '">' + escapeHtml(r.date_achieved) + '</td>' +
      '<td>' + certBadge(r.status) + '</td></tr>'
    ).join('');
  }

  // Footer info + pager state
  const info = document.getElementById('cert-page-info');
  if (info) {
    info.textContent = total
      ? 'Showing ' + (start + 1) + '\u2013' + (start + pageRows.length) + ' of ' + total +
        (total !== certLb.rows.length ? ' (filtered from ' + certLb.rows.length + ')' : '')
      : '0 results';
  }
  const num = document.getElementById('cert-page-num');
  if (num) num.textContent = 'Page ' + certLb.page + ' of ' + pages;
  const prev = document.getElementById('cert-page-prev');
  const next = document.getElementById('cert-page-next');
  if (prev) prev.disabled = certLb.page <= 1;
  if (next) next.disabled = certLb.page >= pages;

  renderCertSortIndicators();
  refreshCertIcons();
}

function renderCertSortIndicators() {
  document.querySelectorAll('#cert-leaderboard th.lb-sortable').forEach(th => {
    const active = th.dataset.sort === certLb.sortKey;
    const icon = active ? (certLb.sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
    th.classList.toggle('lb-sorted', active);
    th.setAttribute('aria-sort', active ? (certLb.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
    const span = th.querySelector('.lb-sort-icon');
    if (span) span.innerHTML = '<i data-lucide="' + icon + '" class="icon-xs"></i>';
  });
}

// ---- Controls ------------------------------------------------------------

function populateCertFilterOptions() {
  const select = document.getElementById('cert-filter-cert');
  if (!select) return;
  const names = [...new Set(certLb.rows.map(r => r.certification_name))].sort();
  select.innerHTML = '<option value="">All certifications</option>' +
    names.map(n => '<option value="' + escapeHtml(n) + '">' + escapeHtml(n) + '</option>').join('');
}

function initCertLeaderboardControls() {
  const byId = id => document.getElementById(id);
  const onChange = (el, evt, fn) => { if (el) el.addEventListener(evt, fn); };

  let searchTimer;
  onChange(byId('cert-filter-search'), 'input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      certLb.search = e.target.value.trim();
      certLb.page = 1;
      renderCertLeaderboard();
    }, 200);
  });
  onChange(byId('cert-filter-cert'), 'change', e => {
    certLb.cert = e.target.value; certLb.page = 1; renderCertLeaderboard();
  });
  onChange(byId('cert-filter-status'), 'change', e => {
    certLb.status = e.target.value; certLb.page = 1; renderCertLeaderboard();
  });
  onChange(byId('cert-page-size'), 'change', e => {
    certLb.pageSize = parseInt(e.target.value, 10) || 10; certLb.page = 1; renderCertLeaderboard();
  });
  onChange(byId('cert-page-prev'), 'click', () => { certLb.page -= 1; renderCertLeaderboard(); });
  onChange(byId('cert-page-next'), 'click', () => { certLb.page += 1; renderCertLeaderboard(); });
  onChange(byId('cert-filter-reset'), 'click', () => {
    Object.assign(certLb, { search: '', cert: '', status: '', sortKey: null, sortDir: 'asc', page: 1 });
    ['cert-filter-search', 'cert-filter-cert', 'cert-filter-status'].forEach(id => { const el = byId(id); if (el) el.value = ''; });
    renderCertLeaderboard();
  });

  // Header click: asc -> desc -> back to default ranking
  document.querySelectorAll('#cert-leaderboard th.lb-sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (certLb.sortKey !== key) { certLb.sortKey = key; certLb.sortDir = 'asc'; }
      else if (certLb.sortDir === 'asc') { certLb.sortDir = 'desc'; }
      else { certLb.sortKey = null; certLb.sortDir = 'asc'; }
      certLb.page = 1;
      renderCertLeaderboard();
    });
  });
}

// ---- Data loading --------------------------------------------------------

function loadCertLeaderboard() {
  const body = document.getElementById('cert-leaderboard-body');
  if (!body) return;

  fetch('/api/cert-leaderboard')
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      certLb.rows = (data.rows || []).map(r => ({
        ...r,
        employee_name: r.employee_name || '',
        certification_name: r.certification_name || '',
        status: certStatus(r.expiry_date)
      }));
      populateCertFilterOptions();
      renderCertLeaderboard();
    })
    .catch(err => {
      renderCertMessage(body, 'Could not load leaderboard: ' + escapeHtml(err.message), 'var(--accent)');
      const info = document.getElementById('cert-page-info');
      if (info) info.textContent = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initCertLeaderboardControls();
  loadCertLeaderboard();
});
